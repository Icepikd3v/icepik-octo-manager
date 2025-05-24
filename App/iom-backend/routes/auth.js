// routes/auth.js
const express = require("express");
const { register, login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected
router.get("/me", authMiddleware, (req, res) => {
  res.json({ userId: req.user.id, message: "You are authenticated" });
});

module.exports = router;
