// services/octoprintManager.js
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
require("dotenv").config();

const BASE_URL = process.env.OCTOPRINT_BASE_URL;
const API_KEY = process.env.OCTOPRINT_API_KEY;

const PATHS = {
  EnderDirect: process.env.OCTOPRINT_DIRECT_PATH,
  EnderMultiColor: process.env.OCTOPRINT_MULTICOLOR_PATH,
};

const API_KEYS = {
  EnderDirect: process.env.OCTOPRINT_DIRECT_API_KEY || API_KEY,
  EnderMultiColor: process.env.OCTOPRINT_MULTICOLOR_API_KEY || API_KEY,
};

const getFullUrl = (printer, endpoint = "") => {
  const path = PATHS[printer];
  if (!path) throw new Error("Invalid printer type");
  return `${BASE_URL}${path}${endpoint}`;
};

// Upload a file to OctoPrint
const uploadToOctoPrint = async (filename, printer = "EnderDirect") => {
  try {
    const url = getFullUrl(printer, "/api/files/local");
    const form = new FormData();
    form.append("file", fs.createReadStream(`uploads/${filename}`));

    const headers = {
      "X-Api-Key": API_KEYS[printer],
      ...form.getHeaders(),
    };

    const response = await axios.post(url, form, { headers });
    return response.data;
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    return null;
  }
};

// Start a print job
const startPrintJob = async ({ printer, filename }) => {
  try {
    const url = getFullUrl(printer, `/api/files/local/${filename}`);
    const headers = {
      "X-Api-Key": API_KEYS[printer],
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      url,
      { command: "select", print: true },
      { headers },
    );
    return response.data;
  } catch (err) {
    console.error("❌ Start job error:", err.message);
    return { error: err.message };
  }
};

// Pause, Resume, Cancel, Status
const pausePrint = async (printer) => {
  const url = getFullUrl(printer, "/api/job");
  const headers = {
    "X-Api-Key": API_KEYS[printer],
    "Content-Type": "application/json",
  };
  await axios.post(url, { command: "pause", action: "pause" }, { headers });
};

const resumePrint = async (printer) => {
  const url = getFullUrl(printer, "/api/job");
  const headers = {
    "X-Api-Key": API_KEYS[printer],
    "Content-Type": "application/json",
  };
  await axios.post(url, { command: "pause", action: "resume" }, { headers });
};

const cancelPrint = async (printer) => {
  const url = getFullUrl(printer, "/api/job");
  const headers = {
    "X-Api-Key": API_KEYS[printer],
    "Content-Type": "application/json",
  };
  await axios.post(url, { command: "cancel" }, { headers });
};

const getPrintStatus = async (printer) => {
  const url = getFullUrl(printer, "/api/job");
  const headers = { "X-Api-Key": API_KEYS[printer] };
  const res = await axios.get(url, { headers });
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
  try {
    const url = getFullUrl(
      printer,
      `/api/files/local/${encodeURIComponent(filename)}`,
    );
    const headers = { "X-Api-Key": API_KEYS[printer] };
    const res = await axios.delete(url, { headers });
    return { success: true, response: res.data };
  } catch (err) {
    console.error("❌ OctoPrint delete error:", err.message);
    return { error: err.message };
  }
};

const getPrinterFiles = async (printer) => {
  const url = getFullUrl(printer, "/api/files");
  const headers = { "X-Api-Key": API_KEYS[printer] };
  const res = await axios.get(url, { headers });
  return res.data.files || [];
};

const getWebcamStreamUrl = (printer) => {
  return printer === "EnderMultiColor"
    ? process.env.WEBCAM_MULTICOLOR
    : process.env.WEBCAM_DIRECT;
};

module.exports = {
  uploadToOctoPrint,
  startPrintJob,
  pausePrint,
  resumePrint,
  cancelPrint,
  getPrintStatus,
  getPrinterStatus, // ✅ Now included in export
  deleteOctoPrintFile,
  getPrinterFiles,
  getWebcamStreamUrl,
};
