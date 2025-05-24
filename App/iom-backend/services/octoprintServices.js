// services/octoprintServices.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
require("dotenv").config();

const BASE_URL = process.env.OCTOPRINT_BASE_URL;
const API_KEY = process.env.OCTOPRINT_API_KEY;
const PATH_MULTICOLOR = process.env.OCTOPRINT_MULTICOLOR_PATH;
const PATH_DIRECT = process.env.OCTOPRINT_DIRECT_PATH;

/**
 * Uploads a file from your local uploads/ folder to the specified OctoPrint instance.
 * @param {string} filename - The name of the file in uploads/
 * @param {string} printer - "EnderMultiColor" or "EnderDirect"
 */
const uploadToOctoPrint = async (filename, printer = "EnderDirect") => {
  try {
    // Corrected to match exact casing:
    const printerPath =
      printer === "EnderMultiColor" ? PATH_MULTICOLOR : PATH_DIRECT;

    const uploadUrl = `${BASE_URL}${printerPath}/api/files/local`;
    console.log(`Uploading ${filename} to OctoPrint at: ${uploadUrl}`);

    const filePath = path.join(__dirname, "..", "uploads", filename);
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath), filename);

    const response = await axios.post(uploadUrl, form, {
      headers: {
        ...form.getHeaders(),
        "X-Api-Key": API_KEY,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log(`✅ Uploaded ${filename} to ${printer}`);
    return response.data;
  } catch (err) {
    console.error(
      `❌ OctoPrint upload failed to ${printer}:`,
      err.response?.data || err.message,
    );
    return null;
  }
};

const getPrintStatus = async (printer = "EnderDirect") => {
  const printerPath =
    printer === "EnderMultiColor" ? PATH_MULTICOLOR : PATH_DIRECT;
  const statusUrl = `${BASE_URL}${printerPath}/api/job`;

  try {
    const response = await axios.get(statusUrl, {
      headers: { "X-Api-Key": API_KEY },
    });
    return response.data;
  } catch (err) {
    console.error(`❌ Failed to fetch status from ${printer}:`, err.message);
    return { error: err.message };
  }
};

const pausePrint = async (printer = "EnderDirect") => {
  const printerPath =
    printer === "EnderMultiColor" ? PATH_MULTICOLOR : PATH_DIRECT;
  const url = `${BASE_URL}${printerPath}/api/job`;

  return axios.post(
    url,
    { command: "pause", action: "pause" },
    {
      headers: {
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json",
      },
    },
  );
};

const resumePrint = async (printer = "EnderDirect") => {
  const printerPath =
    printer === "EnderMultiColor" ? PATH_MULTICOLOR : PATH_DIRECT;
  const url = `${BASE_URL}${printerPath}/api/job`;

  return axios.post(
    url,
    { command: "pause", action: "resume" },
    {
      headers: {
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json",
      },
    },
  );
};

const cancelPrint = async (printer = "EnderDirect") => {
  const printerPath =
    printer === "EnderMultiColor" ? PATH_MULTICOLOR : PATH_DIRECT;
  const url = `${BASE_URL}${printerPath}/api/job`;

  return axios.post(
    url,
    { command: "cancel" },
    {
      headers: {
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json",
      },
    },
  );
};

const getWebcamStreamUrl = (printer = "EnderDirect") => {
  const printerPath =
    printer === "EnderMultiColor" ? PATH_MULTICOLOR : PATH_DIRECT;
  return `${BASE_URL}${printerPath}/webcam/?action=stream`;
};

const getPrinterFiles = async (printer = "EnderDirect") => {
  const printerPath =
    printer === "EnderMultiColor" ? PATH_MULTICOLOR : PATH_DIRECT;
  const filesUrl = `${BASE_URL}${printerPath}/api/files`;

  try {
    const response = await axios.get(filesUrl, {
      headers: { "X-Api-Key": API_KEY },
    });
    const files = response.data.files || [];
    return files
      .filter((f) => f.name.endsWith(".gcode") || f.name.endsWith(".aw.gcode"))
      .map((f) => ({
        name: f.name,
        size: f.size,
        origin: f.origin,
        date: f.date,
      }));
  } catch (err) {
    console.error(`❌ Failed to list files from ${printer}:`, err.message);
    return [];
  }
};

const deleteOctoPrintFile = async (filename, printer = "EnderDirect") => {
  const printerPath =
    printer === "EnderMultiColor" ? PATH_MULTICOLOR : PATH_DIRECT;
  const url = `${BASE_URL}${printerPath}/api/files/local/${encodeURIComponent(
    filename,
  )}`;

  try {
    await axios.delete(url, {
      headers: { "X-Api-Key": API_KEY },
    });
    console.log(`🗑️ Deleted ${filename} from ${printer}`);
  } catch (err) {
    console.warn(
      `⚠️ OctoPrint file delete failed on ${printer}:`,
      err.response?.data || err.message,
    );
  }
};

module.exports = {
  uploadToOctoPrint,
  getPrintStatus,
  pausePrint,
  resumePrint,
  cancelPrint,
  getWebcamStreamUrl,
  getPrinterFiles,
  deleteOctoPrintFile,
};
