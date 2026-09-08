const jwt = require("jsonwebtoken");
const User = require("../models/Users");
module.exports = async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
  const cookie = (req.headers.cookie || "").split(";").map(value => value.trim()).find(value => value.startsWith("ironroot_session="));
  const token = bearer || cookie?.slice("ironroot_session=".length);
  if (!token) return res.status(401).json({ message: "Please sign in to continue." });
  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }); }
  catch { return res.status(401).json({ message: "Your session has expired. Please sign in again." }); }
  try {
    const user = await User.findById(decoded.id).select("username email isAdmin emailVerified");
    if (!user || !user.emailVerified) return res.status(401).json({ message: "Please sign in again." });
    req.user = { id: user._id.toString(), isAdmin: user.isAdmin };
    req.account = user;
    next();
  } catch { res.status(503).json({ message: "Account service is unavailable." }); }
};
