// utils/queueManager.js
const PrintJob = require("../models/PrintJob");
const {
  startPrintJob,
  getPrinterFiles,
} = require("../services/octoprintManager");
const { logEvent } = require("../services/analyticsService");
const { notifyUser } = require("../services/emailManager");
const User = require("../models/Users");

const tierPriority = {
  gold: 1,
  silver: 2,
  bronze: 3,
  basic: 4,
};

async function processNextPrintInQueue(printer) {
  console.log("🔁 Processing next job in queue for", printer);

  try {
    const allQueuedJobs = await PrintJob.find({
      printer,
      status: "queued",
    }).populate("userId");

    if (!allQueuedJobs.length) {
      console.log(`ℹ️ No queued jobs found for ${printer}`);
      return;
    }

    allQueuedJobs.sort((a, b) => {
      const tierA = a.userId.subscriptionTier || "basic";
      const tierB = b.userId.subscriptionTier || "basic";
      const priorityDiff = tierPriority[tierA] - tierPriority[tierB];
      if (priorityDiff !== 0) return priorityDiff;
      return a.createdAt - b.createdAt;
    });

    const nextJob = allQueuedJobs[0];
    const files = await getPrinterFiles(printer);
    const matchingFile = files.find((f) => f.name === nextJob.filename);

    if (!matchingFile) {
      console.warn(`⚠️ File not found on OctoPrint: ${nextJob.filename}`);
      return;
    }

    console.log("🔄 Starting queued job:", nextJob.filename);

    // Retry logic with 2 attempts and delay if 409 Conflict
    let attempt = 0;
    let result = { error: "Initial" };

    while (attempt < 2) {
      result = await startPrintJob({ printer, filename: nextJob.filename });
      if (!result.error) break;

      if (result.error.response && result.error.response.status === 409) {
        console.warn(`⚠️ Attempt ${attempt + 1} failed with 409. Retrying...`);
        await new Promise((res) => setTimeout(res, 10000));
        attempt++;
      } else {
        console.error("❌ Start job error:", result.error);
        return;
      }
    }

    if (result.error) {
      console.error("❌ Failed after retries:", result.error);
      return;
    }

    nextJob.status = "printing";
    nextJob.startedAt = new Date();
    await nextJob.save();

    const user = await User.findById(nextJob.userId);
    if (user) {
      await notifyUser("started", user, {
        printer,
        filename: nextJob.filename,
      });
    }

    await logEvent(nextJob.userId, "print_started", {
      printer,
      filename: nextJob.filename,
      jobId: nextJob._id,
    });

    console.log(`✅ Auto-started queued job: ${nextJob.filename}`);
  } catch (err) {
    console.error(`❌ Failed to start print from queue:`, err);
  }
}

module.exports = { processNextPrintInQueue };
