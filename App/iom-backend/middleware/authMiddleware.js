// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Debug log
  if (!authHeader) {
    console.warn("🔒 No Authorization header provided");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    console.warn("🔒 Malformed Authorization header:", authHeader);
    return res.status(401).json({ message: "Unauthorized: Malformed token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "username email subscriptionTier isAdmin avatar bio isVerified",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Account not verified" });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      bio: user.bio,
      isVerified: user.isVerified,
    };

    next();
  } catch (err) {
    console.error("❌ authMiddleware error:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = authMiddleware;
