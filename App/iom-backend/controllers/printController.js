const axios = require("axios");
require("dotenv").config();

const BASE_URL = process.env.OCTOPRINT_BASE_URL;
const API_KEY = process.env.OCTOPRINT_API_KEY;
const PATH_MULTICOLOR = process.env.OCTOPRINT_MULTICOLOR_PATH;
const PATH_DIRECT = process.env.OCTOPRINT_DIRECT_PATH;

/**
 * Start a print job by selecting a file and triggering print on the target printer
 *
 * @param {Object} params - Required params
 * @param {string} params.printer - Printer identifier (e.g. "EnderDirect")
 * @param {string} params.filename - Name of the uploaded file in OctoPrint (must match exactly)
 * @returns {Object} success or error object
 */
const startPrintJob = async ({ printer, filename }) => {
  try {
    if (!printer || !filename) {
      return { error: "Missing printer or filename." };
    }

    const printerPath =
      printer === "EnderMulticolor" ? PATH_MULTICOLOR : PATH_DIRECT;
    const apiBase = `${BASE_URL}${printerPath}`;
    const encodedFilename = encodeURIComponent(filename);

    // Optional: Delay to ensure OctoPrint has indexed the uploaded file
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 1: Select and print the file
    await axios.post(
      `${apiBase}/api/files/local/${encodedFilename}`,
      { command: "select", print: true },
      {
        headers: {
          "X-Api-Key": API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`🟢 Print started: ${filename} on ${printer}`);
    return { success: true };
  } catch (err) {
    const raw = err.response?.data || err.message;
    console.error("❌ Print start failed:", raw);
    return {
      error:
        err.response?.data?.message ||
        `Failed to start print job for "${filename || "unknown"}".`,
    };
  }
};

module.exports = { startPrintJob };
