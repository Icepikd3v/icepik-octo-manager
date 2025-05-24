const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const { startPrintJob } = require("../controllers/printController");

const {
  pausePrint,
  resumePrint,
  cancelPrint,
} = require("../services/octoprintServices");

// POST /api/print/start
router.post("/start", auth, startPrintJob);

// POST /api/print/pause
router.post("/pause", auth, async (req, res) => {
  const printer = req.body.printer || "EnderDirect";
  try {
    await pausePrint(printer);
    res.status(200).json({ message: "Print paused" });
  } catch (err) {
    console.error("❌ Pause error:", err.message);
    res.status(500).json({ message: "Failed to pause print" });
  }
});

// POST /api/print/resume
router.post("/resume", auth, async (req, res) => {
  const printer = req.body.printer || "EnderDirect";
  try {
    await resumePrint(printer);
    res.status(200).json({ message: "Print resumed" });
  } catch (err) {
    console.error("❌ Resume error:", err.message);
    res.status(500).json({ message: "Failed to resume print" });
  }
});

// POST /api/print/cancel
router.post("/cancel", auth, async (req, res) => {
  const printer = req.body.printer || "EnderDirect";
  try {
    await cancelPrint(printer);
    res.status(200).json({ message: "Print cancelled" });
  } catch (err) {
    console.error("❌ Cancel error:", err.message);
    res.status(500).json({ message: "Failed to cancel print" });
  }
});

module.exports = router;
