// utils/processQueue.js
const PrintJob = require("../models/PrintJob");
const Printer = require("../models/Printer");
const User = require("../models/Users");
const { logEvent } = require("../services/analyticsService");
const { notifyUser } = require("../services/emailManager");
const {
  startPrintJob,
  getPrinterState,
} = require("../services/octoprintManager");
const sortQueue = require("./queueHelper");

async function processQueueForPrinter(printerName) {
  try {
    const printer = await Printer.findOne({ name: printerName });
    if (!printer || printer.isUnderMaintenance) return;

    const state = await getPrinterState(printerName);
    if (state !== "Operational") return;

    const queuedJobs = await PrintJob.find({
      printer: printerName,
      status: "queued",
    })
      .sort({ createdAt: 1 })
      .lean();

    if (!queuedJobs.length) return;

    const sortedJobs = await sortQueue(queuedJobs);
    const nextJob = sortedJobs[0];
    if (!nextJob) return;

    // Start the print job
    const result = await startPrintJob({
      printer: printerName,
      filename: nextJob.filename,
    });

    if (result.error) {
      console.error(`❌ Failed to start job ${nextJob._id}:`, result.error);
      return;
    }

    await PrintJob.findByIdAndUpdate(nextJob._id, {
      status: "printing",
      startedAt: new Date(),
    });

    await logEvent(nextJob.userId, "print_started", {
      printer: printerName,
      filename: nextJob.filename,
      jobId: nextJob._id,
    });

    const user = await User.findById(nextJob.userId);
    if (user) {
      await notifyUser("started", user, {
        filename: nextJob.filename,
        printer: printerName,
      });
    }

    console.log(`✅ Auto-started print job ${nextJob._id} on ${printerName}`);
  } catch (err) {
    console.error("❌ Queue processing error:", err);
  }
}

module.exports = { processQueueForPrinter };
