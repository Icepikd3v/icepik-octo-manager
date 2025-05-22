const express = require("express");
const router = express.Router();
const PrintJob = require("../models/PrintJob");
const auth = require("../middleware/authMiddleware");
const { startPrintJob } = require("../controllers/printController");
const {
  getPrintStatus,
  pausePrint,
  resumePrint,
  cancelPrint,
} = require("../services/octoprintServices");

// POST /api/print-jobs - Start a print AND log it
router.post("/", auth, async (req, res) => {
  try {
    console.log("🧾 Incoming body:", req.body);
    const { printer, filename, modelFileId } = req.body;

    if (!printer || !filename || !modelFileId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const result = await startPrintJob(req.body);

    if (result?.error) {
      console.error("❌ OctoPrint Error:", result.error);
      return res.status(500).json({ message: result.error });
    }

    const newJob = await PrintJob.create({
      userId: req.user.id,
      printer,
      filename,
      modelFile: modelFileId,
      startedAt: new Date(),
      status: "printing",
    });

    res.status(201).json({
      message: "Print started and logged.",
      printJob: newJob,
    });
  } catch (err) {
    console.error("❌ Route Error:", err.message || err);
    res.status(500).json({
      message: err.message || "Failed to start or log print job.",
    });
  }
});

// GET /api/print-jobs - Get all print jobs for current user
router.get("/", auth, async (req, res) => {
  try {
    const jobs = await PrintJob.find({ userId: req.user.id }).sort({
      startedAt: -1,
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/print-jobs/:id/status - Check real-time print status
router.get("/:id/status", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (job.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const printer = job.printer;
    const octoStatus = await getPrintStatus(printer);

    res.json({
      jobId: job._id,
      printer,
      status: octoStatus.state || "unknown",
      progress: octoStatus.progress || {},
      file: octoStatus.job?.file?.name || null,
    });
  } catch (err) {
    console.error("❌ Status check failed:", err.message);
    res.status(500).json({ message: "Failed to fetch print job status." });
  }
});

// POST /api/print-jobs/:id/pause - Pause print
router.post("/:id/pause", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (job.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await pausePrint(job.printer);
    res.json({ message: "Print paused." });
  } catch (err) {
    res.status(500).json({ message: "Failed to pause print." });
  }
});

// POST /api/print-jobs/:id/resume - Resume print
router.post("/:id/resume", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (job.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await resumePrint(job.printer);
    res.json({ message: "Print resumed." });
  } catch (err) {
    res.status(500).json({ message: "Failed to resume print." });
  }
});

// POST /api/print-jobs/:id/cancel - Cancel print
router.post("/:id/cancel", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (job.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await cancelPrint(job.printer);
    res.json({ message: "Print canceled." });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel print." });
  }
});

// PATCH /api/print-jobs/:id/sync - Sync OctoPrint status to DB
router.patch("/:id/sync", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });
    if (job.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const printer = job.printer;
    const octo = await getPrintStatus(printer);

    if (octo.state) {
      let newStatus = job.status;
      if (
        octo.state.toLowerCase() === "operational" &&
        octo.progress?.completion === 100
      ) {
        newStatus = "completed";
      } else if (octo.state.toLowerCase().includes("pause")) {
        newStatus = "paused";
      } else if (octo.state.toLowerCase().includes("cancel")) {
        newStatus = "canceled";
      }

      if (newStatus !== job.status) {
        job.status = newStatus;
        await job.save();
      }
    }

    res.json({
      message: "Status synced",
      status: job.status,
    });
  } catch (err) {
    console.error("❌ Sync error:", err.message);
    res.status(500).json({ message: "Failed to sync print job status." });
  }
});

module.exports = router;
