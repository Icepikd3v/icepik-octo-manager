// routes/printJobs.js
const express = require("express");
const router = express.Router();
const PrintJob = require("../models/PrintJob");
const User = require("../models/Users");
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const { startPrintJob } = require("../controllers/printController");
const {
  getPrintStatus,
  pausePrint,
  resumePrint,
  cancelPrint,
  getPrinterFiles,
} = require("../services/octoprintServices");
const { sendEmail } = require("../services/emailService");
const {
  queued,
  started,
  completed,
  canceled,
  shipped,
} = require("../services/emailTemplates");
const { logEvent } = require("../services/analyticsService");

// POST /api/print-jobs — Start or queue a print job
router.post("/", auth, async (req, res) => {
  try {
    const { printer, filename, modelFileId } = req.body;
    if (!printer || !filename || !modelFileId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const activeCount = await PrintJob.countDocuments({
      printer,
      status: "printing",
    });
    const shouldStart = activeCount === 0 || user.subscriptionTier === "elite";

    let toPrintFilename = filename;
    const files = await getPrinterFiles(printer);
    const base = filename.replace(/\.gcode$/i, "");
    const awName = files
      .map((f) => f.name)
      .find(
        (name) =>
          name.toLowerCase().startsWith(base.toLowerCase()) &&
          name.toLowerCase().endsWith(".aw.gcode"),
      );
    if (awName) {
      toPrintFilename = awName;
    }

    const newJob = await PrintJob.create({
      userId: req.user.id,
      printer,
      filename: toPrintFilename,
      modelFile: modelFileId,
      status: shouldStart ? "printing" : "queued",
      startedAt: shouldStart ? new Date() : null,
    });

    await logEvent(user._id, shouldStart ? "print_started" : "print_queued", {
      printer,
      filename: toPrintFilename,
      jobId: newJob._id,
    });

    const tpl = shouldStart
      ? started({ username: user.username, filename: toPrintFilename, printer })
      : queued({ username: user.username, filename: toPrintFilename });
    await sendEmail(user.email, tpl.subject, tpl.html);

    if (shouldStart) {
      const result = await startPrintJob({
        printer,
        filename: toPrintFilename,
      });
      if (result.error) {
        newJob.status = "failed";
        await newJob.save();
        return res.status(500).json({ message: result.error });
      }
    }

    return res.status(201).json({
      message: shouldStart
        ? "Print started and logged."
        : "Printer busy—your job is queued.",
      printJob: newJob,
    });
  } catch (err) {
    console.error("❌ Route Error:", err);
    return res.status(500).json({ message: "Failed to process print job." });
  }
});

// GET /api/print-jobs/history — user print history with filters/pagination
router.get("/history", auth, async (req, res) => {
  try {
    const { status, printer, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (printer) filter.printer = printer;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const history = await PrintJob.find(filter)
      .populate("modelFile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load print history." });
  }
});

// GET /api/print-jobs/:id — user or admin fetches single job
router.get("/:id", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id)
      .populate("modelFile")
      .populate("userId", "username email");
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (
      job.userId._id.toString() !== req.user.id &&
      req.user.subscriptionTier !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch job details." });
  }
});

// GET /api/print-jobs — admin view with filters/pagination
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const { status, printer, userId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (printer) filter.printer = printer;
    if (userId) filter.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const jobs = await PrintJob.find(filter)
      .populate("userId", "username email")
      .populate("modelFile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load print jobs." });
  }
});

module.exports = router;
