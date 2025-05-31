const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const Printer = require("../models/Printer");
const {
  getWebcamStreamUrl,
  getPrinterFiles,
} = require("../services/octoprintManager");

// === 🎥 Webcam Stream URL
router.get("/:name/webcam", auth, (req, res) => {
  const printer = req.params.name;

  try {
    const url = getWebcamStreamUrl(printer);
    res.json({ url });
  } catch (err) {
    console.error("❌ Webcam URL error:", err.message);
    res.status(500).json({ message: "Failed to generate webcam stream URL." });
  }
});

// === 📁 List OctoPrint Files
router.get("/:name/files", auth, async (req, res) => {
  const printer = req.params.name;

  try {
    const files = await getPrinterFiles(printer);
    res.json({ files });
  } catch (err) {
    console.error("❌ File list error:", err.message);
    res.status(500).json({ message: "Failed to retrieve file list." });
  }
});

// === 🔐 Admin: List All Printers
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const printers = await Printer.find();
    res.json(printers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch printers." });
  }
});

// === 🔧 Admin: Toggle Maintenance Mode
router.patch("/:name/maintenance", auth, adminOnly, async (req, res) => {
  const { name } = req.params;
  const { isUnderMaintenance } = req.body;

  try {
    const printer = await Printer.findOneAndUpdate(
      { name },
      { isUnderMaintenance },
      { new: true },
    );

    if (!printer) {
      return res.status(404).json({ message: "Printer not found." });
    }

    res.json({
      message: `${name} maintenance mode set to ${isUnderMaintenance}`,
      printer,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update printer status." });
  }
});

module.exports = router;
