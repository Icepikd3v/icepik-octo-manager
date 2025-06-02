// models/PrintJob.js
const mongoose = require("mongoose");

const printJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    printer: {
      type: String,
      enum: ["EnderMultiColor", "EnderDirect"],
      required: true,
    },
    filename: { type: String, required: true },
    modelFile: { type: mongoose.Schema.Types.ObjectId, ref: "ModelFile" },
    startedAt: { type: Date, default: null },
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
  },
  { timestamps: true }, // ✅ Required for sorting by createdAt
);

module.exports = mongoose.model("PrintJob", printJobSchema);
