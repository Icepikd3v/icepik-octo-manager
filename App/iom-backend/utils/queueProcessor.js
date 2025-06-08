// utils/queueProcessor.js

const PrintJob = require("../models/PrintJob");
const User = require("../models/Users");
const Printer = require("../models/Printer");
const {
  getPrinterFiles,
  startPrintJob,
  getPrinterState,
} = require("../services/octoprintManager");
const { notifyUser } = require("../services/emailManager");
const { logEvent } = require("../services/analyticsService");

const tierPriority = {
  gold: 1,
  silver: 2,
  bronze: 3,
  basic: 4,
};

const HOURS_TO_START = 24;

async function processNextPrintInQueue(printerName) {
  try {
    const printer = await Printer.findOne({ name: printerName });
    if (!printer || printer.isUnderMaintenance) return;

    const printerState = await getPrinterState(printerName);
    if (printerState !== "Operational") return;

    const jobs = await PrintJob.find({ printer: printerName, status: "queued" })
      .populate("userId")
      .sort({ createdAt: 1 });

    if (!jobs.length) return;

    // Sort by subscription tier priority first, then by submission time
    jobs.sort((a, b) => {
      const tierA = a.userId.subscriptionTier || "basic";
      const tierB = b.userId.subscriptionTier || "basic";
      const priorityDiff = tierPriority[tierA] - tierPriority[tierB];
      if (priorityDiff !== 0) return priorityDiff;
      return a.createdAt - b.createdAt;
    });

    const now = new Date();
    let nextJob = null;

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const deadline = new Date(job.createdAt);
      deadline.setHours(deadline.getHours() + HOURS_TO_START);

      if (now > deadline) {
        // Deadline missed — move to back of queue and notify
        await logEvent(job.userId._id, "deadline_missed", {
          jobId: job._id,
          filename: job.filename,
          printer: job.printer,
        });

        await notifyUser("missed_deadline", job.userId, {
          filename: job.filename,
          printer: job.printer,
        });

        job.createdAt = new Date(); // bump to back of queue
        await job.save();
        continue;
      }

      // Valid job found — notify user to start manually
      nextJob = job;

      await notifyUser("start_now", job.userId, {
        filename: job.filename,
        printer: job.printer,
        jobId: job._id.toString(), // ✅ Pass jobId for email link
      });

      await logEvent(job.userId._id, "start_window_open", {
        jobId: job._id,
        printer: job.printer,
        filename: job.filename,
      });

      console.log(`📩 Sent start prompt to user ${job.userId.email}`);
      break;
    }
  } catch (err) {
    console.error("❌ Queue processing failed:", err.message);
  }
}

module.exports = { processNextPrintInQueue };
