const User = require("../models/Users");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    next();
  } catch (err) {
    console.error("❌ Admin check failed:", err.message);
    res.status(500).json({ message: "Failed to verify admin access" });
  }
};

module.exports = adminMiddleware;
