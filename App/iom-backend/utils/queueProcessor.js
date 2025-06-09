const PrintJob = require("../models/PrintJob");
const User = require("../models/Users");
const { sendEmail } = require("../services/emailManager");
const {
  getPrinterStatus,
  startPrintJob,
} = require("../services/octoprintManager");

const processPrintQueue = async (printer) => {
  try {
    const queuedJobs = await PrintJob.find({ status: "queued", printer }).sort({
      createdAt: 1,
    });

    if (!queuedJobs.length) return;

    const nextJob = queuedJobs[0];
    const user = await User.findById(nextJob.userId);
    if (!user || !user.isVerified) return;

    const printerStatus = await getPrinterStatus(printer);
    if (printerStatus !== "operational") return;

    const result = await startPrintJob({
      printer,
      filename: nextJob.filename,
    });

    if (result && !result.error) {
      nextJob.status = "printing";
      nextJob.startedAt = new Date();
      await nextJob.save();
      console.log(`🖨️ Started job: ${nextJob.filename}`);
    } else {
      console.error(
        "❌ Failed to start print job:",
        result.error || "unknown error",
      );
    }
  } catch (err) {
    console.error("❌ Queue processing error:", err.message);
  }
};

module.exports = {
  processNextPrintInQueue: processPrintQueue,
};
