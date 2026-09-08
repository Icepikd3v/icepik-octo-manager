const axios = require("axios");
const { getOctoPrintConfig } = require("../config/octoprint");
async function getPrinterStatus(id) {
  const updatedAt = new Date().toISOString();
  try {
    const { baseUrl, apiKey } = getOctoPrintConfig(id);
    const get = endpoint => axios.get(`${baseUrl}/api/${endpoint}`, { headers: { "X-Api-Key": apiKey }, timeout: 5000, maxRedirects: 0 });
    const connection = await get("connection");
    const state = connection.data.current?.state || "Unknown";
    const connected = !["Closed", "Offline", "Error", "Unknown", "Detecting serial connection", "Connecting"].includes(state) && !state.startsWith("Error:");
    const [printer, job] = connected ? await Promise.allSettled([get("printer"), get("job")]) : [];
    const temperatures = printer?.status === "fulfilled" ? printer.value.data.temperature : null;
    const currentJob = job?.status === "fulfilled" ? job.value.data : null;
    return { id, name: id, reachable: true, connected, state, updatedAt,
      nozzle: temperatures?.tool0 || null, bed: temperatures?.bed || null,
      job: currentJob ? { path: currentJob.job?.file?.path || currentJob.job?.file?.name || null, filename: currentJob.job?.file?.display || currentJob.job?.file?.name || null, completion: currentJob.progress?.completion ?? null, secondsLeft: currentJob.progress?.printTimeLeft ?? null } : null,
      partial: connected && (printer?.status !== "fulfilled" || job?.status !== "fulfilled") };
  } catch (err) {
    return { id, name: id, reachable: false, connected: false, state: "Unavailable", updatedAt, message: err.response?.status === 401 || err.response?.status === 403 ? "Printer authentication failed." : "Cannot reach this printer. Check its connection." };
  }
}
module.exports = { getPrinterStatus };
