// routes/webhooks.js
const express = require("express");
const router = express.Router();

const PrintJob = require("../models/PrintJob");
const { logEvent } = require("../services/analyticsService");
const { notifyUser } = require("../services/emailManager");
const { processNextPrintInQueue } = require("../utils/queueManager");

// Normalize filename by stripping .aw.gcode if present
const normalizeFilename = (name) => {
  return name.replace(/\.aw\.gcode$/, ".gcode");
};

router.post("/octoprint", async (req, res) => {
  try {
    // Validate header token from OctoPrint
    const headerToken = req.headers["x-webhook-token"];
    const expectedToken = process.env.OCTOPRINT_WEBHOOK_TOKEN;

    console.log("🕵️ Incoming X-Webhook-Token:", headerToken);
    console.log("🔐 Expected token:", expectedToken);
    console.log("📥 Webhook body:", req.body);

    if (headerToken !== expectedToken) {
      console.warn("❌ Invalid X-Webhook-Token");
      return res.status(403).json({ message: "Forbidden" });
    }

    const printer = req.body.deviceIdentifier;
    const topic = req.body.topic;
    const rawFilename = req.body.print_name;
    const filename = normalizeFilename(rawFilename);

    const job = await PrintJob.findOne({ filename });

    if (!job) {
      console.warn("⚠️ No matching print job found for:", rawFilename);
      return res.status(200).json({ message: "No matching print job" });
    }

    // Determine new status from topic
    let newStatus = null;
    const lowerTopic = topic.toLowerCase();

    if (lowerTopic.includes("started")) newStatus = "printing";
    else if (lowerTopic.includes("done")) newStatus = "completed";
    else if (lowerTopic.includes("failed")) newStatus = "failed";
    else if (
      lowerTopic.includes("cancelled") ||
      lowerTopic.includes("canceled")
    )
      newStatus = "canceled";

    if (newStatus) {
      job.status = newStatus;
      await job.save();

      await logEvent(job.userId, `webhook_${newStatus}`, {
        printer,
        filename,
        jobId: job._id,
      });

      if (newStatus === "completed") {
        await notifyUser(
          job.userId,
          "✅ Your print is complete!",
          `Your file ${filename} has successfully finished printing.`,
        );

        await processNextPrintInQueue(printer);
      }

      console.log(`✅ Webhook processed: ${filename} → ${newStatus}`);
      return res.json({ message: `Status updated to ${newStatus}` });
    }

    console.warn("⚠️ Unhandled webhook topic:", topic);
    return res.status(200).json({ message: "Unhandled topic" });
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    res.status(500).json({ message: "Webhook handler failed" });
  }
});

module.exports = router;
