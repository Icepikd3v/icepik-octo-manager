const mongoose = require("mongoose");

const printJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  modelName: { type: String, required: true },
  status: { type: String, default: "pending" }, // e.g. pending, in-progress, complete
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PrintJob", printJobSchema);
