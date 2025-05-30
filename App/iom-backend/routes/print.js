// routes/print.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  pause,
  resume,
  cancel,
} = require("../controllers/printControlController");

const PrintJob = require("../models/PrintJob");
const { notifyUser } = require("../services/emailManager");
const { logEvent } = require("../services/analyticsService");

// === ✅ Admin Print Controls ===
router.post("/pause", auth, adminOnly, pause);
router.post("/resume", auth, adminOnly, resume);
router.post("/cancel", auth, adminOnly, cancel);

module.exports = router;

// === 🔒 DEV ONLY: MOCK COMPLETED ===
// router.post("/mock-complete/:id", auth, adminOnly, async (req, res) => {
//   try {
//     const job = await PrintJob.findById(req.params.id).populate("userId");
//     if (!job || job.status !== "printing") {
//       return res
//         .status(400)
//         .json({ message: "Job not found or not currently printing" });
//     }

//     job.status = "completed";
//     job.completedAt = new Date();
//     await job.save();

//     await logEvent(job.userId._id, "print_completed", {
//       printer: job.printer,
//       filename: job.filename,
//       jobId: job._id,
//     });

//     await notifyUser("completed", job.userId, {
//       filename: job.filename,
//       printer: job.printer,
//     });

//     res.json({
//       message: "✅ Print marked as completed and user notified",
//       job,
//     });
//   } catch (err) {
//     console.error("❌ Mock complete error:", err.message);
//     res.status(500).json({ message: "Failed to mark print as completed." });
//   }
// });

// === 🔒 DEV ONLY: MOCK SHIPPED ===
// router.post("/mock-ship/:id", auth, adminOnly, async (req, res) => {
//   try {
//     const job = await PrintJob.findById(req.params.id).populate("userId");
//     if (!job || job.status !== "completed") {
//       return res
//         .status(400)
//         .json({ message: "Job not found or not marked as completed" });
//     }

//     job.status = "shipped";
//     job.shippedAt = new Date();
//     await job.save();

//     await logEvent(job.userId._id, "print_shipped", {
//       printer: job.printer,
//       filename: job.filename,
//       jobId: job._id,
//     });

//     await notifyUser("shipped", job.userId, {
//       filename: job.filename,
//       printer: job.printer,
//     });

//     res.json({
//       message: "📦 Print marked as shipped and user notified",
//       job,
//     });
//   } catch (err) {
//     console.error("❌ Mock shipped error:", err.message);
//     res.status(500).json({ message: "Failed to mark print as shipped." });
//   }
// });
