// utils/scheduler.js
const cron = require("node-cron");
const checkManualStartQueue = require("./checkManualStartQueue");
const expireStartWindows = require("./expireStartWindows");

// Queue Monitor: remind users every 8 hours
function scheduleCheckManualStartQueue() {
  cron.schedule("0 */8 * * *", async () => {
    console.log("🕗 [8H] Reminding users to start print jobs...");
    try {
      await checkManualStartQueue("EnderMultiColor");
      await checkManualStartQueue("EnderDirect");
    } catch (err) {
      console.error("❌ Error in checkManualStartQueue:", err.message);
    }
  });
}

// Expire 24-Hour Manual Start Windows
function scheduleExpireStartWindows() {
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ [24H] Checking for expired manual start windows...");
    try {
      await expireStartWindows("EnderMultiColor");
      await expireStartWindows("EnderDirect");
    } catch (err) {
      console.error("❌ Error in expireStartWindows:", err.message);
    }
  });
}

function startQueueMonitor() {
  console.log("📅 Cron jobs scheduled: [8H Reminder, 24H Expiry]");
  scheduleCheckManualStartQueue();
  scheduleExpireStartWindows();
}

module.exports = { startQueueMonitor };
