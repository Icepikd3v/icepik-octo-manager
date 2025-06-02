// services/emailManager.js
const { sendEmail } = require("./emailService");
const templates = require("./emailTemplates");
const { getWebcamStreamUrl } = require("./octoprintManager");

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
  const resetLink = `http://localhost:3001/api/auth/reset-password/${resetToken}`;
  console.log(`🔑 Password reset link: ${resetLink}`);

  await sendEmail(
    to,
    "🔑 Reset Your IOM Password",
    `<p>You requested a password reset. Click below:</p>
     <p><a href="${resetLink}">${resetLink}</a></p>
     <p>This link will expire in 30 minutes.</p>`,
  );
}

module.exports = {
  notifyUser,
  sendPasswordResetEmail,
};
