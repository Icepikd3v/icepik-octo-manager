const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    avatar: { type: String, default: "" },
    bio: { type: String, default: "" }, // ✅ Added bio field

    subscriptionTier: {
      type: String,
      enum: ["basic", "bronze", "silver", "gold"],
      default: "basic",
      required: true,
    },
    stripeSubscriptionId: { type: String },
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },

    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetToken: String,
    resetTokenExpiry: Date,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
