// routes/users.js
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/Users");

const router = express.Router();

// GET /api/users — return all users (dev-only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "-password -__v").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/subscription — update subscription tier
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
