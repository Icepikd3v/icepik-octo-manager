// controllers/uploadController.js

const path = require("path");
const ModelFile = require("../models/ModelFile");
const PrintJob = require("../models/PrintJob");
const User = require("../models/Users");

const {
  uploadToOctoPrint,
  getPrintStatus,
} = require("../services/octoprintManager");

const { logEvent } = require("../services/analyticsService");
const { notifyUser } = require("../services/emailManager");
const { processNextPrintInQueue } = require("../utils/queueProcessor"); // ✅ NEW

/**
 * Handle a user uploading a model file.
 */
const handleModelUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // ✅ Normalize & validate printer
    const rawPrinter = req.body.printer;
    const printer = rawPrinter?.trim();
    const allowedPrinters = ["EnderMultiColor", "EnderDirect"];
    if (!printer || !allowedPrinters.includes(printer)) {
      console.error("❌ Invalid printer input:", printer);
      return res.status(400).json({ error: "Invalid printer type" });
    }

    let status = "queued";
    let finalFilename = req.file.filename;

    // ✅ Push .gcode files to OctoPrint
    const ext = path.extname(req.file.filename).toLowerCase();
    if (ext === ".gcode") {
      const octoPrintResponse = await uploadToOctoPrint(
        req.file.filename,
        printer,
      );

      finalFilename =
        octoPrintResponse?.files?.local?.name || req.file.filename;
      status = octoPrintResponse ? "sent" : "ready";
    }

    // ✅ Save uploaded model file in DB
    const newFile = await ModelFile.create({
      name: req.file.originalname,
      filename: finalFilename,
      userId: req.user.id,
      printer,
      status,
    });

    await logEvent(req.user.id, "file_upload", {
      filename: newFile.filename,
      status: newFile.status,
      printer: newFile.printer,
      size: req.file.size,
    });

    // ✅ Create associated print job
    const newJob = await PrintJob.create({
      userId: req.user.id,
      printer,
      filename: newFile.filename,
      modelFile: newFile._id,
    });

    const statusData = await getPrintStatus(printer);
    const isPrinting =
      statusData.state && statusData.state.toLowerCase().includes("print");

    if (!isPrinting) {
      // ✅ Try to auto-start this job now
      await processNextPrintInQueue(printer);
    } else {
      // ✅ Log and notify if printer is busy
      await logEvent(req.user.id, "print_queued", {
        filename: newFile.filename,
        printer,
        jobId: newJob._id,
      });

      const user = await User.findById(req.user.id);
      if (user?.email) {
        await notifyUser("queued", user, {
          printer,
          filename: newFile.filename,
        });
      }

      console.log(`🕒 Printer ${printer} is busy. Job queued.`);
    }

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
