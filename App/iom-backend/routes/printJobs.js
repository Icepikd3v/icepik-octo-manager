const express = require("express");
const router = express.Router();
const PrintJob = require("../models/PrintJob");
const User = require("../models/Users");
const auth = require("../middleware/authMiddleware");
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

// POST /api/print-jobs — Start or queue a print job
router.post("/", auth, async (req, res) => {
  try {
    const { printer, filename, modelFileId } = req.body;
    if (!printer || !filename || !modelFileId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Count active prints
    const activeCount = await PrintJob.countDocuments({
      printer,
      status: "printing",
    });

    // Immediate start if free or elite user
    const shouldStart = activeCount === 0 || user.subscriptionTier === "elite";

    // Auto-detect Arc-Welder file for ANY printer
    let toPrintFilename = filename;
    {
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
        console.log(`🔍 Using Arc-Welder file for ${printer}: ${awName}`);
        toPrintFilename = awName;
      }
    }

    // Record the job
    const newJob = await PrintJob.create({
      userId: req.user.id,
      printer,
      filename: toPrintFilename,
      modelFile: modelFileId,
      status: shouldStart ? "printing" : "queued",
      startedAt: shouldStart ? new Date() : null,
    });

    // Send initial email (queued or started)
    const tpl = shouldStart
      ? started({ username: user.username, filename: toPrintFilename, printer })
      : queued({ username: user.username, filename: toPrintFilename });
    await sendEmail(user.email, tpl.subject, tpl.html);

    // If we should start, invoke OctoPrint
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

// GET /api/print-jobs — List a user’s jobs
router.get("/", auth, async (req, res) => {
  try {
    const jobs = await PrintJob.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/print-jobs/:id/status — Real-time status
router.get("/:id/status", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (job.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const octoStatus = await getPrintStatus(job.printer);
    res.json({
      jobId: job._id,
      printer: job.printer,
      status: octoStatus.state || job.status,
      progress: octoStatus.progress || {},
      file: octoStatus.job?.file?.name || job.filename,
    });
  } catch (err) {
    console.error("❌ Status check failed:", err);
    res.status(500).json({ message: "Failed to fetch print job status." });
  }
});

// POST /api/print-jobs/:id/pause — Pause a print
router.post("/:id/pause", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (job.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await pausePrint(job.printer);
    job.status = "paused";
    await job.save();

    const owner = await User.findById(job.userId);
    const tpl = canceled({ username: owner.username, filename: job.filename });
    await sendEmail(owner.email, tpl.subject, tpl.html);

    res.json({ message: "Print paused." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to pause print." });
  }
});

// POST /api/print-jobs/:id/resume — Resume a print
router.post("/:id/resume", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (job.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await resumePrint(job.printer);
    job.status = "printing";
    await job.save();

    const owner = await User.findById(job.userId);
    const tpl = started({
      username: owner.username,
      filename: job.filename,
      printer: job.printer,
    });
    await sendEmail(owner.email, tpl.subject, tpl.html);

    res.json({ message: "Print resumed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resume print." });
  }
});

// POST /api/print-jobs/:id/cancel — Cancel a print
router.post("/:id/cancel", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (job.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await cancelPrint(job.printer);
    job.status = "canceled";
    await job.save();

    const owner = await User.findById(job.userId);
    const tpl = canceled({ username: owner.username, filename: job.filename });
    await sendEmail(owner.email, tpl.subject, tpl.html);

    res.json({ message: "Print canceled." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cancel print." });
  }
});

// PATCH /api/print-jobs/:id/sync — Sync status and process queue
router.patch("/:id/sync", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (job.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const octo = await getPrintStatus(job.printer);
    let newStatus = job.status;

    if (
      octo.state.toLowerCase() === "operational" &&
      octo.progress?.completion === 100
    ) {
      newStatus = "completed";
    }

    if (newStatus !== job.status) {
      job.status = newStatus;
      await job.save();

      const owner = await User.findById(job.userId);

      if (newStatus === "completed") {
        const tpl = completed({
          username: owner.username,
          filename: job.filename,
        });
        await sendEmail(owner.email, tpl.subject, tpl.html);

        // Auto-start next in queue
        const next = await PrintJob.findOne({
          printer: job.printer,
          status: "queued",
        }).sort({
          createdAt: 1,
        });
        if (next) {
          // AW lookup for the next job
          let nextFilename = next.filename;
          const filesList = await getPrinterFiles(next.printer);
          const nextBase = next.filename.replace(/\.gcode$/i, "");
          const nextAw = filesList
            .map((f) => f.name)
            .find(
              (name) =>
                name.toLowerCase().startsWith(nextBase.toLowerCase()) &&
                name.toLowerCase().endsWith(".aw.gcode"),
            );
          if (nextAw) nextFilename = nextAw;

          const resStart = await startPrintJob({
            printer: next.printer,
            filename: nextFilename,
          });
          if (!resStart.error) {
            next.status = "printing";
            next.startedAt = new Date();
            next.filename = nextFilename;
            await next.save();

            const nextOwner = await User.findById(next.userId);
            const nextTpl = started({
              username: nextOwner.username,
              filename: nextFilename,
              printer: next.printer,
            });
            await sendEmail(nextOwner.email, nextTpl.subject, nextTpl.html);
          }
        }
      }
    }

    res.json({ message: "Status synced", status: job.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to sync print job status." });
  }
});

// POST /api/print-jobs/:id/ship — Mark shipped and notify
router.post("/:id/ship", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (job.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    job.status = "shipped";
    await job.save();

    const owner = await User.findById(job.userId);
    const tpl = shipped({
      username: owner.username,
      filename: job.filename,
      trackingUrl: req.body.trackingUrl,
    });
    await sendEmail(owner.email, tpl.subject, tpl.html);

    res.json({ message: "Job marked as shipped and user notified." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to ship print job." });
  }
});

module.exports = router;
