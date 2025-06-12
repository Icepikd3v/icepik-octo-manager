// controllers/avatarController.js

const path = require("path");
const fs = require("fs");
const User = require("../models/Users");

// Save avatars to /uploads/avatars and update user profile
const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Sanitize filename: remove special characters and replace spaces/dashes
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${req.user.id}-${Date.now()}${extension}`;
    const targetPath = path.join(__dirname, "..", "uploads/avatars", safeName);

    // Move file from temp to avatars folder with safe name
    fs.renameSync(file.path, targetPath);

    // Save relative path to MongoDB (served via express.static)
    const avatarUrl = `/uploads/avatars/${safeName}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true },
    ).select("username email avatar");

    res.json({ message: "Avatar uploaded", avatarUrl });
  } catch (err) {
    console.error("❌ Avatar upload failed:", err.message);
    res.status(500).json({ message: "Failed to upload avatar" });
  }
};

module.exports = { uploadAvatar };
