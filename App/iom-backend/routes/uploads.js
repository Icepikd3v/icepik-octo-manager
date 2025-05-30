// routes/uploads.js

const express = require("express");
const fs = require("fs");
const path = require("path");

const upload = require("../middleware/uploadMiddleware");
const auth = require("../middleware/authMiddleware");

const ModelFile = require("../models/ModelFile");
const {
  uploadToOctoPrint,
  deleteOctoPrintFile,
} = require("../services/octoprintManager");

const { handleModelUpload } = require("../controllers/uploadController");

const router = express.Router();

// ✅ POST /api/models/upload — Upload model file
router.post(
  "/upload",
  auth,
  (req, res, next) => {
    upload.single("file")(req, res, function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  handleModelUpload,
);

// ✅ GET /api/models — List user's uploaded models
router.get("/", auth, async (req, res) => {
  try {
    const files = await ModelFile.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE /api/models/:id — Delete model + .aw.gcode variant
router.delete("/:id", auth, async (req, res) => {
  try {
    const file = await ModelFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    // Only allow owner to delete
    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Build base name and check for both .gcode and .aw.gcode variants
    const baseName = file.filename.replace(/\.gcode$/i, "");
    const variants = [`${baseName}.gcode`, `${baseName}.aw.gcode`];

    for (const variant of variants) {
      try {
        await deleteOctoPrintFile(variant, file.printer);
        console.log(`🧹 Deleted from OctoPrint: ${variant}`);
      } catch (err) {
        console.warn(
          `⚠️ Could not delete ${variant} from OctoPrint:`,
          err.message,
        );
      }
    }

    // Delete from local uploads folder
    const filePath = path.join(__dirname, "..", "uploads", file.filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.warn(
          `⚠️ Failed to delete local file: ${file.filename}`,
          err.message,
        );
      }
    });

    // Delete from MongoDB
    await ModelFile.deleteOne({ _id: file._id });

    res.status(200).json({
      message: "🗑️ File fully deleted",
      filename: file.filename,
      printer: file.printer,
    });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ message: "Failed to delete file" });
  }
});

module.exports = router;
