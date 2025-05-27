// controllers/uploadController.js

const path = require("path");
const ModelFile = require("../models/ModelFile");
const { uploadToOctoPrint } = require("../services/octoprintServices");
const { logEvent } = require("../services/analyticsService"); // Import logEvent

/**
 * Handle a user uploading a model file.
 */
const handleModelUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const printer = req.body.printer || "EnderDirect";
    let status = "queued";

    // Push .gcode files directly to OctoPrint
    const ext = path.extname(req.file.filename).toLowerCase();
    if (ext === ".gcode") {
      const octoPrintResponse = await uploadToOctoPrint(
        req.file.filename,
        printer,
      );
      status = octoPrintResponse ? "sent" : "ready";
    }

    // Save metadata in MongoDB
    const newFile = await ModelFile.create({
      name: req.file.originalname,
      filename: req.file.filename,
      userId: req.user.id,
      printer,
      status,
    });

    // Debug log to confirm import
    console.log("🟡 typeof logEvent:", typeof logEvent);

    // Log analytics event
    await logEvent(req.user.id, "file_upload", {
      filename: newFile.filename,
      status: newFile.status,
      printer: newFile.printer,
      size: req.file.size,
    });

    console.log("📂 Upload controller completed successfully");

    // Return response
    res.status(201).json({
      message: "Model uploaded successfully.",
      file: {
        id: newFile._id,
        name: newFile.name,
        filename: newFile.filename,
        printer: newFile.printer,
        status: newFile.status,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (err) {
    console.error("❌ Upload error:", err.message);
    res.status(500).json({ error: "Failed to upload model file." });
  }
};

module.exports = { handleModelUpload };
