const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getWebcamStreamUrl,
  getPrinterFiles,
} = require("../services/octoprintServices");

// GET /api/printers/:name/webcam - Return webcam stream URL for a printer
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

// GET /api/printers/:name/files - List available files on OctoPrint
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

module.exports = router;
