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

    modelFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ModelFile",
    },

    startedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: [
        "queued",
        "pending_user_start", // User was notified, has 24hr to start
        "printing",
        "paused",
        "completed",
        "canceled",
        "failed",
        "shipped",
      ],
      default: "queued",
    },

    startBy: {
      type: Date,
      default: null, // Deadline for user to start job
    },

    timesDeferred: {
      type: Number,
      default: 0, // Number of times passed to back of queue
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PrintJob", printJobSchema);
