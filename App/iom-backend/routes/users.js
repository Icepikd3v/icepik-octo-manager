// routes/users.js
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const User = require("../models/Users");

const router = express.Router();

/* ------------------- Admin: List All Users ------------------- */
router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, "-password -__v").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------- Update Avatar ------------------- */
router.patch("/avatar", authMiddleware, async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ message: "Avatar URL required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true },
    ).select("username email avatar");

    res.json({
      message: "Avatar updated",
      user,
    });
  } catch (err) {
    console.error("❌ Avatar update error:", err.message);
    res.status(500).json({ message: "Failed to update avatar" });
  }
});

/* ------------------- Update Subscription Tier ------------------- */
router.patch("/subscription", authMiddleware, async (req, res) => {
  try {
    const { tier } = req.body;
    const validTiers = ["basic", "bronze", "silver", "gold"];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ message: "Invalid subscription tier" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { subscriptionTier: tier },
      { new: true },
    ).select("username email subscriptionTier");

    res.json({
      message: `Subscription updated to ${user.subscriptionTier}`,
      tier: user.subscriptionTier,
    });
  } catch (err) {
    console.error("❌ Subscription update error:", err.message);
    res.status(500).json({ message: "Failed to update subscription" });
  }
});

module.exports = router;
