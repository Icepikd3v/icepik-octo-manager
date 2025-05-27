const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscriptionTier: {
      type: String,
      enum: ["basic", "pro", "elite"],
      default: "basic",
      required: true,
    },
    isAdmin: { type: Boolean, default: false }, // ✅ Added for admin-only access
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
