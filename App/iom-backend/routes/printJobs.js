// routes/printJobs.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const subscriptionCheck = require("../middleware/subscriptionMiddleware");

const PrintJob = require("../models/PrintJob");
const { createPrintJob } = require("../controllers/printJobController");
const { logEvent } = require("../services/analyticsService");
const {
  getPrinterStatus,
  startPrintJob,
} = require("../services/octoprintManager");

// === Create a new print job (requires subscription)
router.post("/", auth, subscriptionCheck, createPrintJob);

// === Live printer data (real-time print status)
router.get("/live", auth, async (req, res) => {
  try {
    const printers = ["EnderMultiColor", "EnderDirect"];
    const results = [];

    for (const printer of printers) {
      const data = await getPrinterStatus(printer);

      let currentPrint = null;
      if (data?.job?.file?.name) {
        const filename = data.job.file.name;
        try {
          const printJob = await PrintJob.findOne({ filename });
          currentPrint = {
            filename,
            progress: data.progress?.completion || 0,
          };
        } catch (err) {
          console.warn(`⚠️ Failed to look up print job for ${filename}`);
        }
      }

      results.push({
        printer,
        status: data?.state?.text || "unknown",
        streamUrl:
          printer === "EnderMultiColor"
            ? process.env.WEBCAM_MULTICOLOR
            : process.env.WEBCAM_DIRECT,
        currentPrint,
      });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Error in /live route:", err.message);
    res.status(500).json({ message: "Failed to fetch job details." });
  }
});

// === View queue of upcoming print jobs
router.get("/queue", auth, async (req, res) => {
  try {
    const jobs = await PrintJob.find({ status: "queued" })
      .sort({ createdAt: 1 })
      .populate("userId", "username email");
    res.json(jobs);
  } catch (err) {
    console.error("❌ Queue fetch failed:", err.message);
    res.status(500).json({ message: "Failed to fetch print queue." });
  }
});

// === User's print history
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

// === Get a single print job (admin or owner)
router.get("/:id", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id)
      .populate("modelFile")
      .populate("userId", "username email");

    if (!job) {
      return res.status(404).json({ message: "Print job not found" });
    }

    const jobUserId = job.userId?._id?.toString() || job.userId?.toString();
    const currentUserId = req.user.id.toString();
    const isOwner = jobUserId === currentUserId;
    const isAdmin = req.user.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(job);
  } catch (err) {
    console.error("❌ Error fetching job:", err.message);
    res.status(500).json({ message: "Failed to fetch job details." });
  }
});

// === Start print job (manual trigger by owner)
router.post("/:id/start", auth, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Print job not found" });
    }

    const isOwner = job.userId.toString() === req.user.id.toString();
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to start this print" });
    }

    if (job.status !== "queued") {
      return res
        .status(400)
        .json({ message: "Print job is not in a queued state" });
    }

    const result = await startPrintJob({
      printer: job.printer,
      filename: job.filename,
    });

    if (result?.error) {
      return res
        .status(500)
        .json({ message: `OctoPrint error: ${result.error}` });
    }

    job.status = "printing";
    job.startedAt = new Date();
    await job.save();

    await logEvent(req.user.id, "user_started_print_job", {
      jobId: job._id,
      filename: job.filename,
    });

    res.json({ message: "Print job started!" });
  } catch (err) {
    console.error("❌ Failed to start print job:", err.message);
    res.status(500).json({ message: "Failed to start print job." });
  }
});

// === Admin: all print jobs with filters
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

// === Admin: delete print job
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Print job not found" });

    await PrintJob.deleteOne({ _id: req.params.id });

    await logEvent(req.user.id, "admin_deleted_print_job", {
      jobId: job._id,
      filename: job.filename,
      userId: job.userId,
    });

    res.json({ message: "🗑️ Print job deleted successfully." });
  } catch (err) {
    console.error("❌ Failed to delete print job:", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
