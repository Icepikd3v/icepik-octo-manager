// routes/models.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const upload = require("../middleware/uploadMiddleware");
const auth = require("../middleware/authMiddleware");
const ModelFile = require("../models/ModelFile");
const { deleteOctoPrintFile } = require("../services/octoprintServices");

// POST /api/models/upload - Upload a model file
router.post(
  "/upload",
  auth,
  (req, res, next) => {
    upload.single("file")(req, res, function (err) {
      if (err instanceof multer.MulterError || err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const newFile = await ModelFile.create({
        name: req.file.originalname,
        filename: req.file.filename,
        userId: req.user.id,
        printer: req.body.printer || "EnderDirect", // store printer info if passed
        status: "ready",
      });

      res.status(201).json({
        message: "File uploaded",
        file: {
          id: newFile._id,
          name: newFile.name,
          filename: newFile.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          printer: newFile.printer,
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// GET /api/models - List uploaded files for current user
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

// DELETE /api/models/:id - Delete a user's model file
router.delete("/:id", auth, async (req, res) => {
  try {
    const file = await ModelFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete from OctoPrint if applicable
    const ext = path.extname(file.filename).toLowerCase();
    if (ext === ".gcode" || ext === ".aw.gcode") {
      await deleteOctoPrintFile(file.filename, file.printer || "EnderDirect");
    }

    // Delete from disk
    const filePath = path.join(__dirname, "..", "uploads", file.filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.warn(
          `⚠️ Failed to delete local file ${file.filename}:`,
          err.message,
        );
      }
    });

    // Delete from MongoDB
    await ModelFile.deleteOne({ _id: file._id });

    // Log and respond
    console.log(
      `🗑️ Deleted model ${file.filename} (ID: ${file._id}) by user ${req.user.id}`,
    );
    res.status(200).json({
      message: "File deleted",
      filename: file.filename,
      printer: file.printer,
    });
  } catch (err) {
    console.error("❌ Delete route error:", err.message);
    res.status(500).json({ message: "Failed to delete file" });
  }
});

module.exports = router;
