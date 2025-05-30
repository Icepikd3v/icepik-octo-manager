// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const { register, login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/Users");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// POST /api/auth/verify — confirm email using token
router.post("/verify", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email, verificationToken: code });
    if (!user) {
      return res.status(400).json({ message: "Invalid token or email" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      message: "Account verified",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Verification error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error during verification" });
  }
});

// Protected test route
router.get("/me", authMiddleware, (req, res) => {
  res.json({ userId: req.user.id, message: "You are authenticated" });
});

module.exports = router;
