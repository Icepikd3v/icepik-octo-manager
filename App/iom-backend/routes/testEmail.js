// routes/testEmail.js
const express = require("express");
const router = express.Router();
const { sendEmail } = require("../services/emailService");

// GET /api/test-email?to=recipient@example.com
router.get("/", async (req, res) => {
  const to = req.query.to;
  if (!to) {
    return res.status(400).json({ message: "Query param `to` is required" });
  }

  try {
    await sendEmail(
      to,
      "IOM Email Service Test",
      `<p>This is a test email from your IOM application.</p>`,
    );
    res.json({ message: `Test email sent to ${to}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send test email" });
  }
});

module.exports = router;
