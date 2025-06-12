// utils/expireStartWindows.js
const PrintJob = require("../models/PrintJob");
const { logEvent } = require("../services/analyticsService");
const { sendEmail } = require("../services/emailManager");
const User = require("../models/Users");

async function expireStartWindows(printer) {
  const now = new Date();
  const threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h ago

  const expiredJobs = await PrintJob.find({
    printer,
    status: "queued",
    notifiedAt: { $lte: threshold },
  });

  for (const job of expiredJobs) {
    job.timesDeferred = (job.timesDeferred || 0) + 1;

    if (job.timesDeferred >= 3) {
      // Notify user of removal
      const user = await User.findById(job.userId);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: "❌ Your print job was removed from the queue",
          html: `<p>Hi ${user.username},</p>
            <p>Your job <strong>${job.filename}</strong> was removed after missing 3 opportunities to start printing.</p>
            <p>You may re-upload the file to try again.</p>`,
        });
      }

      await logEvent(job.userId, "job_removed_due_to_inactivity", {
        filename: job.filename,
        printer,
        jobId: job._id,
      });

      await PrintJob.deleteOne({ _id: job._id });
      console.log(`❌ Removed stale job after 3 deferrals: ${job.filename}`);
    } else {
      // Reset notifiedAt and move to back of queue
      job.notifiedAt = null;
      await job.save();

      await logEvent(job.userId, "job_deferred", {
        filename: job.filename,
        printer,
        jobId: job._id,
        timesDeferred: job.timesDeferred,
      });

      console.log(
        `🔁 Job deferred: ${job.filename} (attempt ${job.timesDeferred})`,
      );
    }
  }
}

module.exports = expireStartWindows;
