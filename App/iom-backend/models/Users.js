// models/Users.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscriptionTier: {
      type: String,
      enum: ["basic", "bronze", "silver", "gold"],
      default: "basic",
      required: true,
    },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
