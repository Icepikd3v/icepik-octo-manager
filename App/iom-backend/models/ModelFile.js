const mongoose = require("mongoose");

const modelFileSchema = new mongoose.Schema({
  receiptPending: { type: Boolean, default: false },
  size: { type: Number, default: 0 },
  name: { type: String, required: true },
  filename: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["queued", "ready", "sent"], // upload status tracking
    default: "queued",
  },
  printer: {
    type: String,
    enum: ["ED1", "ED2", "EnderMultiColor", "EnderDirect"], // printer destination
    default: "ED1",
  },
});

module.exports = mongoose.model("ModelFile", modelFileSchema);
