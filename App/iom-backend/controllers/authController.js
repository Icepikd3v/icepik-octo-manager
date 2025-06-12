// controllers/authController.js
const User = require("../models/Users.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../services/emailManager");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: process.env.NODE_ENV === "test" ? true : false,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    if (process.env.NODE_ENV !== "test") {
      await sendVerificationEmail(email, verificationToken);
    }

    return res.status(201).json({
      message: "User created.",
      user: { id: newUser._id, username, email },
      ...(process.env.NODE_ENV === "test" && { token }),
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const verify = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully." });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Verification failed." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const avatarUrl = user.avatar?.startsWith("/uploads")
      ? `http://localhost:3001${user.avatar}`
      : user.avatar || null;

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: avatarUrl,
        subscriptionTier: user.subscriptionTier || null,
        subscriptionStartDate: user.subscriptionStartDate || null,
        subscriptionEndDate: user.subscriptionEndDate || null,
        bio: user.bio || "",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "username email avatar subscriptionTier subscriptionStartDate subscriptionEndDate bio",
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    const avatarUrl = user.avatar?.startsWith("/uploads")
      ? `http://localhost:3001${user.avatar}`
      : user.avatar || null;

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: avatarUrl,
        subscriptionTier: user.subscriptionTier || null,
        subscriptionStartDate: user.subscriptionStartDate || null,
        subscriptionEndDate: user.subscriptionEndDate || null,
        bio: user.bio || "",
      },
    });
  } catch (err) {
    console.error("❌ /me error:", err.message);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

module.exports = { register, login, verify, me };
