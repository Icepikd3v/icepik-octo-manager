// controllers/printJobController.js

const PrintJob = require("../models/PrintJob");
const ModelFile = require("../models/ModelFile");
const User = require("../models/Users");
const Printer = require("../models/Printer");

const {
  uploadToOctoPrint,
  startPrintJob,
  getPrintStatus,
} = require("../services/octoprintManager");

const { logEvent } = require("../services/analyticsService");
const { notifyUser } = require("../services/emailManager");
const { canStartPrintNow } = require("../utils/subscriptionAccess");
const { processNextPrintInQueue } = require("../utils/queueProcessor");

exports.createPrintJob = async (req, res) => {
  try {
    const { filename, printer, modelFileId } = req.body;
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({ message: "User authentication failed." });
    }

    if (!filename || !printer || !modelFileId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const modelFile = await ModelFile.findById(modelFileId);
    if (!modelFile) {
      return res.status(404).json({ message: "Model file not found." });
    }

    const printerDoc = await Printer.findOne({ name: printer });
    if (!printerDoc || printerDoc.isUnderMaintenance) {
      return res
        .status(400)
        .json({ message: "Selected printer is under maintenance." });
    }

    // ✅ Create the job first regardless of print state
    const newJob = await PrintJob.create({
      userId: user._id,
      printer,
      filename,
      modelFile: modelFileId,
    });

    // ✅ Check printer status and user's eligibility
    const octoStatus = await getPrintStatus(printer);
    const isIdle = octoStatus?.state?.toLowerCase() === "operational";
    const canStart = await canStartPrintNow(user, printer);

    if (isIdle && canStart) {
      await startPrintJob(printer, filename);

      await PrintJob.findByIdAndUpdate(newJob._id, {
        status: "printing",
        startedAt: new Date(),
      });

      await logEvent(user._id, "print_started", {
        printer,
        filename,
        jobId: newJob._id,
      });

      res
        .status(200)
        .json({ message: "Print job started.", jobId: newJob._id });
    } else {
      await logEvent(user._id, "print_queued", {
        printer,
        filename,
        jobId: newJob._id,
      });

      if (user?.email) {
        await notifyUser("queued", user, { printer, filename });
      }

      res
        .status(202)
        .json({ message: "Printer busy — job queued.", jobId: newJob._id });
    }
  } catch (err) {
    console.error("❌ Failed to create print job:", err.message);
    res.status(500).json({ message: "Server error." });
  }
};
