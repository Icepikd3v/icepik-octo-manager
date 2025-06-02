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
    const secret = req.body.apiSecret;
    const expected = process.env.WEBHOOK_SECRET;

    console.log("🕵️ Incoming webhook token:", secret);
    console.log("🔐 Expected secret:", expected);
    console.log("📥 Incoming webhook body:", req.body);

    if (secret !== expected) {
      console.warn("🔐 Invalid webhook secret");
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

    // Map webhook topic to job status
    let newStatus = null;
    const lowerTopic = topic.toLowerCase();

    if (lowerTopic.includes("started")) newStatus = "printing";
    else if (lowerTopic.includes("done"))
      newStatus = "completed"; // ✅ match schema
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

      // Send email for specific events
      if (newStatus === "completed") {
        await notifyUser(
          job.userId,
          "✅ Your print is complete!",
          `Your file ${filename} has successfully finished printing.`,
        );

        // 🔁 Automatically start next print in queue
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
