// utils/checkManualStartQueue.js

const PrintJob = require("../models/PrintJob");
const User = require("../models/Users");
const { notifyUser } = require("../services/emailManager");
const { logEvent } = require("../services/analyticsService");
const { startPrintJob } = require("../services/octoprintManager");

const tierPriority = {
  gold: 1,
  silver: 2,
  bronze: 3,
  basic: 4,
};

async function checkManualStartQueue(printer) {
  try {
    const jobs = await PrintJob.find({ printer, status: "queued" })
      .populate("userId")
      .sort({ createdAt: 1 });

    if (!jobs.length) return;

    const now = new Date();

    // Find job eligible to start
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];

      // Case 1: User was notified but missed the 24h deadline
      if (job.manualStartDeadline && job.manualStartDeadline < now) {
        // Reset notified fields and move to back
        job.notifiedAt = null;
        job.manualStartDeadline = null;
        await job.save();

        await logEvent(job.userId._id, "missed_start_window", {
          filename: job.filename,
          jobId: job._id,
        });

        await notifyUser("missed_window", job.userId, {
          printer: job.printer,
          filename: job.filename,
        });

        console.log(`⏰ Job ${job._id} bumped to back of queue.`);
        continue;
      }

      // Case 2: Not yet notified, notify and set 24h window
      if (!job.notifiedAt) {
        const now = new Date();
        job.notifiedAt = now;
        job.manualStartDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h
        await job.save();

        await logEvent(job.userId._id, "notified_to_start", {
          printer: job.printer,
          filename: job.filename,
          jobId: job._id,
        });

        await notifyUser("your_turn", job.userId, {
          printer: job.printer,
          filename: job.filename,
          deadline: job.manualStartDeadline,
        });

        console.log(
          `📬 Notified user ${job.userId.email} to start job ${job._id}`,
        );
        break; // notify only one user at a time
      }
    }
  } catch (err) {
    console.error("❌ Manual start queue check failed:", err);
  }
}

module.exports = { checkManualStartQueue };
