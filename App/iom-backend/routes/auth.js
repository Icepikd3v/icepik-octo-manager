// routes/auth.js
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  register,
  login,
  verify,
  me,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/Users");
const { sendPasswordResetEmail } = require("../services/emailManager");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify/:token", verify);

// Forgot + Reset Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(200)
        .json({ message: "If user exists, reset email sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 30;
    await user.save();
    await sendPasswordResetEmail(email, resetToken);
    res.json({ message: "Password reset email sent." });
  } catch (err) {
    console.error("❌ Forgot-password error:", err.message);
    res.status(500).json({ message: "Error sending reset email" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset-password error:", err.message);
    res.status(500).json({ message: "Reset failed" });
  }
});

// Authenticated
router.get("/me", authMiddleware, me);

// Avatar Upload
const uploadDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

router.post(
  "/upload-avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    try {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: avatarUrl },
        { new: true },
      ).select("username email avatar");

      res.json({ message: "Avatar uploaded", avatarUrl });
    } catch (err) {
      console.error("❌ Avatar upload error:", err.message);
      res.status(500).json({ message: "Upload failed" });
    }
  },
);

module.exports = router;
