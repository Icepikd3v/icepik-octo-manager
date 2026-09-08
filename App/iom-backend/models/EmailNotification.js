const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  eventKey: { type: String, required: true, unique: true },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  html: { type: String, required: true },
  text: { type: String, required: true },
  status: { type: String, enum: ["pending", "sending", "sent", "failed"], default: "pending" },
  attempts: { type: Number, default: 0 },
  availableAt: { type: Date, default: Date.now },
  expiresAt: Date,
  sentAt: Date,
  messageId: String,
  lastError: String,
}, { timestamps: true });
schema.index({ status: 1, availableAt: 1 });
module.exports = mongoose.model("EmailNotification", schema);
