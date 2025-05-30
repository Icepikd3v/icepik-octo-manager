// controllers/printControlController.js
const {
  pausePrint,
  resumePrint,
  cancelPrint,
} = require("../services/octoprintManager");

exports.pause = async (req, res) => {
  const printer = req.body.printer || "EnderDirect";
  try {
    await pausePrint(printer);
    res.status(200).json({ message: "Print paused" });
  } catch (err) {
    console.error("❌ Pause error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to pause print" });
  }
};

exports.resume = async (req, res) => {
  const printer = req.body.printer || "EnderDirect";
  try {
    await resumePrint(printer);
    res.status(200).json({ message: "Print resumed" });
  } catch (err) {
    console.error("❌ Resume error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to resume print" });
  }
};

exports.cancel = async (req, res) => {
  const printer = req.body.printer || "EnderDirect";
  try {
    await cancelPrint(printer);
    res.status(200).json({ message: "Print cancelled" });
  } catch (err) {
    // Log more detail from OctoPrint response if available
    console.error("❌ Cancel error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to cancel print" });
  }
};
