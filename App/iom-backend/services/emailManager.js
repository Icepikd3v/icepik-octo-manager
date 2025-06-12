// services/emailManager.js
const { sendEmail } = require("./emailService");
const templates = require("./emailTemplates");
const { getWebcamStreamUrl } = require("./octoprintManager");

const BASE_WEB_URL = process.env.BASE_WEB_URL || "http://localhost:3000";

// ✅ Notify user about print job updates
async function notifyUser(status, user, payload = {}) {
  const templateMap = {
    queued: templates.queued,
    started: templates.started,
    print_started: templates.started,
    completed: templates.completed,
    print_done: templates.completed,
    canceled: templates.canceled,
    print_failed: templates.canceled,
    shipped: templates.shipped,
    print_progress: templates.progress,
    start_now: templates.manualStartPrompt, // 🆕 User must manually start
    missed_deadline: templates.missedDeadline, // 🆕 Missed 24h deadline
  };

  const tplFn = templateMap[status];
  if (!tplFn) {
    console.warn(`⚠️ No email template for status: ${status}`);
    return;
  }

  const extendedPayload = {
    ...payload,
    webcamUrl: payload.printer ? getWebcamStreamUrl(payload.printer) : null,
    username: user.username,
  };

  const tpl = tplFn(extendedPayload);
  await sendEmail(user.email, tpl.subject, tpl.html);
}

// ✅ Send password reset email
async function sendPasswordResetEmail(to, resetToken) {
  const resetLink = `${BASE_WEB_URL}/reset-password/${resetToken}`;
  console.log(`🔑 Password reset link: ${resetLink}`);

  await sendEmail(
    to,
    "🔑 Reset Your IOM Password",
    `<p>You requested a password reset. Click the link below to continue:</p>
     <p><a href="${resetLink}">${resetLink}</a></p>
     <p>This link will expire in 30 minutes.</p>`,
  );
}

// ✅ Send verification email
async function sendVerificationEmail(to, token) {
  const verifyLink = `${BASE_WEB_URL}/verify/${token}`;
  console.log(`📨 Verification link: ${verifyLink}`);

  await sendEmail(
    to,
    "✅ Verify Your IOM Email",
    `<p>Welcome! Click the link below to verify your email and activate your account:</p>
     <p><a href="${verifyLink}">${verifyLink}</a></p>
     <p>If you did not request this, please ignore it.</p>`,
  );
}

module.exports = {
  notifyUser,
  sendPasswordResetEmail,
  sendVerificationEmail,
};
