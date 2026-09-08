const express = require("express");
const { register, login, publicUser, cookieOptions } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const router = express.Router();
const attempts = new Map();
const sweep = setInterval(() => { for (const [ip, value] of attempts) if (value.until < Date.now()) attempts.delete(ip); }, 60000);
sweep.unref();
function limit(req, res, next) {
  const now = Date.now();
  const entry = attempts.get(req.ip);
  const value = entry && entry.until > now ? entry : { count: 0, until: now + 15 * 60000 };
  attempts.set(req.ip, value);
  if (++value.count > 30) return res.status(429).json({ message: "Too many attempts. Please try again in 15 minutes." });
  next();
}
router.post("/register", limit, register);
router.post("/login", limit, login);
router.post("/logout", (req, res) => {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie("ironroot_session", options).json({ message: "Signed out." });
});
router.get("/me", auth, (req, res) => res.json({ user: publicUser(req.account) }));
module.exports = router;
