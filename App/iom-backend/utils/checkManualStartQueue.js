// utils/checkManualStartQueue.js
const PrintJob = require("../models/PrintJob");
const { logEvent } = require("../services/analyticsService");

const checkManualStartQueue = async (printer) => {
  try {
    const now = new Date();

    // Find jobs that missed their 24h start window
    const expiredJobs = await PrintJob.find({
      printer,
      status: "pending_user_start",
      startBy: { $lt: now },
    });

    for (const job of expiredJobs) {
      const userId = job.userId?.toString?.();
      const filename = job.filename;

      // If user has already been passed over 3 times, delete the job
      if (job.timesDeferred >= 3) {
        await PrintJob.deleteOne({ _id: job._id });

        await logEvent(userId, "job_removed_expired_3x", {
          printer,
          filename,
          jobId: job._id,
          reason: "Exceeded 3 deferrals",
        });

        console.log(`❌ Removed job (${filename}) after 3 missed chances.`);
        continue;
      }

      // Otherwise, send it back to queue and give another chance
      job.status = "queued";
      job.startBy = null;
      job.timesDeferred += 1;
      await job.save();

      await logEvent(userId, "job_deferred_back_to_queue", {
        printer,
        filename,
        jobId: job._id,
        newTimesDeferred: job.timesDeferred,
      });

      console.log(
        `🔄 Job ${filename} deferred. Total deferrals: ${job.timesDeferred}`,
      );
    }
  } catch (err) {
    console.error("❌ checkManualStartQueue error:", err.message);
  }
};

module.exports = checkManualStartQueue;
