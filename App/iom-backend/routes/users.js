// routes/users.js
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/Users");

const router = express.Router();

// GET /api/users — return all users (dev-only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    // NOTE: we omit sensitive fields
    const users = await User.find({}, "-password -__v").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
