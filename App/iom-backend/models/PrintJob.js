const mongoose = require("mongoose");

const printJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  printer: {
    type: String,
    enum: ["EnderMultiColor", "EnderDirect"],
    required: true,
  },
  filename: { type: String, required: true },
  modelFile: { type: mongoose.Schema.Types.ObjectId, ref: "ModelFile" },
  startedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: [
      "queued",
      "printing",
      "paused",
      "completed",
      "canceled",
      "failed",
      "shipped",
    ],
    default: "queued",
  },
});

module.exports = mongoose.model("PrintJob", printJobSchema);
