// controllers/printController.js
const axios = require("axios");
require("dotenv").config();

const { getOctoPrintConfig } = require("../config/octoprint");

/**
 * Start a print job by selecting a file and triggering print on the target printer
 *
 * @param {Object} params
 * @param {string} params.printer     Printer key: "EnderMultiColor" or "EnderDirect"
 * @param {string} params.filename    Exact filename in OctoPrint (e.g. "... .aw.gcode")
 */
async function startPrintJob({ printer, filename }) {
  try {
    if (!printer || !filename) {
      return { error: "Missing printer or filename." };
    }

    const { baseUrl, apiKey } = getOctoPrintConfig(printer);
    const endpoint = `${baseUrl}/api/files/local/${encodeURIComponent(filename)}`;
    console.log(`➡️  Selecting file at: ${endpoint}`);

    // Step 1: select & print
    await axios.post(
      endpoint,
      { command: "select", print: true },
      {
        headers: {
          "X-Api-Key": apiKey,
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
