const path = require("path");
const ModelFile = require("../models/ModelFile");
const PrintJob = require("../models/PrintJob");
const User = require("../models/Users");

const {
  uploadToOctoPrint,
  getPrintStatus,
  startPrintJob,
} = require("../services/octoprintManager");

const { logEvent } = require("../services/analyticsService");
const { notifyUser } = require("../services/emailManager");
const { processNextPrintInQueue } = require("../utils/queueProcessor");

const handleModelUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const printer = req.body.printer?.trim();
    const allowedPrinters = ["EnderMultiColor", "EnderDirect"];
    if (!printer || !allowedPrinters.includes(printer)) {
      return res.status(400).json({ error: "Invalid printer type" });
    }

    let finalFilename = req.file.filename;
    const ext = path.extname(req.file.filename).toLowerCase();
    let status = "queued";

    if (ext === ".gcode") {
      const octoPrintResponse = await uploadToOctoPrint(finalFilename, printer);
      finalFilename =
        octoPrintResponse?.files?.local?.name || req.file.filename;
      status = octoPrintResponse ? "sent" : "ready";
    }

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
      printer,
      size: req.file.size,
    });

    const newJob = await PrintJob.create({
      userId: req.user.id,
      printer,
      filename: newFile.filename,
      modelFile: newFile._id,
    });

    // ✅ Use improved printer idle detection
    const statusData = await getPrintStatus(printer);
    const printerState = statusData?.state?.toLowerCase() || "";

    const isBusy = ["printing", "paused", "starting", "resuming"].includes(
      printerState,
    );

    if (!isBusy) {
      console.log(`🟢 Printer ${printer} is idle — auto-starting job.`);
      await startPrintJob({
        printer,
        filename: newFile.filename,
      });

      newJob.status = "printing";
      newJob.startedAt = new Date();
      await newJob.save();
    } else {
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
