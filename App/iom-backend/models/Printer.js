const mongoose = require("mongoose");

const printerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isUnderMaintenance: { type: Boolean, default: false },
  description: { type: String, default: "" },
});

module.exports = mongoose.model("Printer", printerSchema);
