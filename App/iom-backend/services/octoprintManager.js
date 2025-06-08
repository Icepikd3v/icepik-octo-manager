// services/octoprintManager.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
require("dotenv").config();

const PrintJob = require("../models/PrintJob");
const User = require("../models/Users");
const { logEvent } = require("../services/analyticsService");

const PRINTERS = {
  EnderMultiColor: {
    url: process.env.OCTOPRINT_URL_MULTI,
    apiKey: process.env.OCTOPRINT_API_KEY_MULTI,
  },
  EnderDirect: {
    url: process.env.OCTOPRINT_URL_DIRECT,
    apiKey: process.env.OCTOPRINT_API_KEY_DIRECT,
  },
};

const getConfig = (printer) => {
  const config = PRINTERS[printer];
  if (!config) throw new Error("Invalid printer type");
  return config;
};

const uploadToOctoPrint = async (filename, printer) => {
  try {
    const { url, apiKey } = getConfig(printer);
    const filePath = path.join(__dirname, "..", "uploads", filename);

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const headers = {
      ...form.getHeaders(),
      "X-Api-Key": apiKey,
    };

    const res = await axios.post(`${url}/api/files/local`, form, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return res.data;
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    return null;
  }
};

const startPrintJob = async ({ printer, filename }) => {
  try {
    const { url, apiKey } = getConfig(printer);
    const res = await axios.post(
      `${url}/api/files/local/${filename}`,
      { command: "select", print: true },
      {
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );
    return res.data;
  } catch (err) {
    console.error("❌ Start job error:", err.message);
    return { error: err.message };
  }
};

const pausePrint = async (printer) => {
  const { url, apiKey } = getConfig(printer);
  await axios.post(
    `${url}/api/job`,
    { command: "pause", action: "pause" },
    { headers: { "X-Api-Key": apiKey } },
  );
};

const resumePrint = async (printer) => {
  const { url, apiKey } = getConfig(printer);
  await axios.post(
    `${url}/api/job`,
    { command: "pause", action: "resume" },
    { headers: { "X-Api-Key": apiKey } },
  );
};

const cancelPrint = async (printer) => {
  const { url, apiKey } = getConfig(printer);
  await axios.post(
    `${url}/api/job`,
    { command: "cancel" },
    { headers: { "X-Api-Key": apiKey } },
  );
};

const getPrintStatus = async (printer) => {
  const { url, apiKey } = getConfig(printer);
  const res = await axios.get(`${url}/api/job`, {
    headers: { "X-Api-Key": apiKey },
  });
  return res.data;
};

const getPrinterStatus = async (printer) => {
  try {
    const job = await getPrintStatus(printer);
    return job?.state?.toLowerCase() || "unknown";
  } catch (err) {
    console.error("❌ Failed to get printer status:", err.message);
    return "unknown";
  }
};

const deleteOctoPrintFile = async (filename, printer) => {
  const { url, apiKey } = getConfig(printer);
  try {
    const res = await axios.delete(
      `${url}/api/files/local/${encodeURIComponent(filename)}`,
      { headers: { "X-Api-Key": apiKey } },
    );
    return { success: true, response: res.data };
  } catch (err) {
    console.error("❌ OctoPrint delete error:", err.message);
    return { error: err.message };
  }
};

const getPrinterFiles = async (printer) => {
  const { url, apiKey } = getConfig(printer);
  const res = await axios.get(`${url}/api/files`, {
    headers: { "X-Api-Key": apiKey },
  });
  return res.data.files || [];
};

const getWebcamStreamUrl = (printer) => {
  return printer === "EnderMultiColor"
    ? process.env.STREAM_URL_MULTI
    : process.env.STREAM_URL_DIRECT;
};

// ✅ Auto-process next job in queue for printer
const processNextInQueue = async (printer) => {
  try {
    const active = await PrintJob.findOne({ printer, status: "printing" });
    if (active) return; // Already printing

    const nextJob = await PrintJob.findOne({ printer, status: "queued" }).sort({
      createdAt: 1,
    });
    if (!nextJob) return;

    const result = await startPrintJob({ printer, filename: nextJob.filename });
    if (result.error) {
      console.error("❌ Failed to start next queued job:", result.error);
      return;
    }

    nextJob.status = "printing";
    nextJob.startedAt = new Date();
    await nextJob.save();

    await logEvent(nextJob.userId, "queue_autostart", {
      printer,
      filename: nextJob.filename,
      jobId: nextJob._id,
    });

    console.log(`✅ Queued job started: ${nextJob.filename}`);
  } catch (err) {
    console.error("❌ Error in processNextInQueue:", err.message);
  }
};

module.exports = {
  uploadToOctoPrint,
  startPrintJob,
  pausePrint,
  resumePrint,
  cancelPrint,
  getPrintStatus,
  getPrinterStatus,
  deleteOctoPrintFile,
  getPrinterFiles,
  getWebcamStreamUrl,
  processNextInQueue,
};
