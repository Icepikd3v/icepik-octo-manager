const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ["basic", "bronze", "silver", "gold"], // You can expand this as needed
  },
  maxPrintsPerMonth: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  features: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Plan", planSchema);
