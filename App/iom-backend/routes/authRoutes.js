// Example in routes/auth.js
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, async (req, res) => {
  res.json({ userId: req.user.id, message: "You are authenticated" });
});
