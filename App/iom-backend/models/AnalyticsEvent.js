const mongoose = require("mongoose");
const analyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  event: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});
module.exports = mongoose.model("AnalyticsEvent", analyticsSchema);
