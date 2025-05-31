const PrintJob = require("../models/PrintJob");
const User = require("../models/Users");
const Printer = require("../models/Printer"); // ✅ Added for maintenance check
const { canStartPrintNow } = require("../utils/subscriptionAccess");
const { logEvent } = require("../services/analyticsService");
const { notifyUser } = require("../services/emailManager");
const octo = require("../services/octoprintManager");

const createPrintJob = async (req, res) => {
  console.log("Incoming print job request:", req.body);

  try {
    const { printer, filename, modelFileId } = req.body;
    if (!printer || !filename || !modelFileId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // ✅ Check maintenance status early
    const printerDoc = await Printer.findOne({ name: printer });
    if (!printerDoc) {
      return res.status(400).json({ message: "Invalid printer." });
    }
    if (printerDoc.isUnderMaintenance) {
      return res.status(503).json({
        message: `${printer} is under maintenance. Please try again later.`,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const shouldStart = await canStartPrintNow(user, printer);

    const files = await octo.getPrinterFiles(printer);
    const base = filename.replace(/\.gcode$/i, "");
    const awName = files.find(
      (f) =>
        f.name.toLowerCase().startsWith(base.toLowerCase()) &&
        f.name.toLowerCase().endsWith(".aw.gcode"),
    );
    const toPrintFilename = awName ? awName.name : filename;

    const newJob = await PrintJob.create({
      userId: user._id,
      printer,
      filename: toPrintFilename,
      modelFile: modelFileId,
      status: shouldStart ? "printing" : "queued",
      startedAt: shouldStart ? new Date() : null,
    });

    await logEvent(user._id, shouldStart ? "print_started" : "print_queued", {
      printer,
      filename: toPrintFilename,
      jobId: newJob._id,
    });

    await notifyUser(shouldStart ? "started" : "queued", user, {
      filename: toPrintFilename,
      printer,
    });

    // 🧪 Skip actual print job during test
    if (process.env.NODE_ENV === "test") {
      console.log("🧪 Test mode: skipping OctoPrint trigger");
      return res.status(201).json({
        message: "Test mode - print job created.",
        printJob: newJob,
      });
    }

    if (shouldStart) {
      const result = await octo.startPrintJob({
        printer,
        filename: toPrintFilename,
      });

      if (result.error) {
        newJob.status = "failed";
        await newJob.save();
        return res.status(500).json({ message: result.error });
      }
    }

    return res.status(201).json({
      message: shouldStart
        ? "Print started and logged."
        : "Printer busy—your job is queued.",
      printJob: newJob,
    });
  } catch (err) {
    console.error("❌ Controller Error:", err);
    res.status(500).json({ message: "Failed to process print job." });
  }
};

module.exports = { createPrintJob };
