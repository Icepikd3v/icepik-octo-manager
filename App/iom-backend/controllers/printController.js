// controllers/printController.js
const axios = require("axios");
require("dotenv").config();

const BASE_URL = process.env.OCTOPRINT_BASE_URL;
const API_KEY = process.env.OCTOPRINT_API_KEY;
const PATH_MULTICOLOR = process.env.OCTOPRINT_MULTICOLOR_PATH;
const PATH_DIRECT = process.env.OCTOPRINT_DIRECT_PATH;

/**
 * Start a print job by selecting a file and triggering print on the target printer
 *
 * @param {Object} params
 * @param {string} params.printer     Printer key: "EnderMulticolor" or "EnderDirect"
 * @param {string} params.filename    Exact filename in OctoPrint (e.g. "... .aw.gcode")
 */
async function startPrintJob({ printer, filename }) {
  try {
    if (!printer || !filename) {
      return { error: "Missing printer or filename." };
    }

    // pick the right URL path prefix
    const printerPath =
      printer === "EnderMultiColor" ? PATH_MULTICOLOR : PATH_DIRECT;
    const apiBase = `${BASE_URL}${printerPath}`;

    // build the select & print URL (no encodeURIComponent)
    const endpoint = `${apiBase}/api/files/local/${filename}`;
    console.log(`➡️  Selecting file at: ${endpoint}`);

    // Step 1: select & print
    await axios.post(
      endpoint,
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
        (err.response?.data?.message &&
          `OctoPrint error: ${err.response.data.message}`) ||
        `Failed to start print job for "${filename}".`,
    };
  }
}

module.exports = { startPrintJob };
