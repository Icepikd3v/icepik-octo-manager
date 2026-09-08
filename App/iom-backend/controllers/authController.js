const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieOptions = () => ({ httpOnly: true, sameSite: "strict", secure: process.env.COOKIE_SECURE === "true", path: "/api", maxAge: 7 * 24 * 60 * 60 * 1000 });
const publicUser = user => ({ id: user._id, username: user.username, email: user.email });
function signIn(res, user, status = 200) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("ironroot_session", token, cookieOptions());
  return res.status(status).json({ user: publicUser(user) });
}
const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (typeof username !== "string" || username.trim().length < 3 || username.length > 80 || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== "string" || password.length < 12 || Buffer.byteLength(password) > 72) {
    return res.status(400).json({ message: "Use a name of 3–80 characters, a valid email, and a password of at least 12 characters (at most 72 bytes)." });
  }
  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account already uses this email. Please sign in." });
    const user = await User.create({ username: username.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12) });
    return signIn(res, user, 201);
  } catch (err) {
    return res.status(err.code === 11000 ? 409 : 500).json({ message: "Could not create your account. Please try again." });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string" || email.length > 254 || Buffer.byteLength(password) > 72) return res.status(400).json({ message: "Enter your email and password." });
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Email or password is incorrect." });
    return signIn(res, user);
  } catch {
    return res.status(503).json({ message: "Sign-in is unavailable. Please try again." });
  }
};
module.exports = { register, login, publicUser, cookieOptions };
