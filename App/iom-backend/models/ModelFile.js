const mongoose = require("mongoose");

const modelFileSchema = new mongoose.Schema({
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
    enum: ["EnderMultiColor", "EnderDirect"], // printer destination
    default: "EnderDirect",
  },
});

module.exports = mongoose.model("ModelFile", modelFileSchema);
