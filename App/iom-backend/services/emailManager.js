// services/emailManager.js
const { sendEmail } = require("./emailService");
const templates = require("./emailTemplates");
const { getWebcamStreamUrl } = require("./octoprintManager"); // ✅ Import webcam helper

/**
 * Notify a user based on the print job status.
 * @param {"queued" | "started" | "completed" | "canceled" | "shipped"} status
 * @param {Object} user - User object with email and username
 * @param {Object} payload - Additional template data: filename, printer, etc.
 */
async function notifyUser(status, user, payload = {}) {
  const templateMap = {
    queued: templates.queued,
    started: templates.started,
    completed: templates.completed,
    canceled: templates.canceled,
    shipped: templates.shipped,
  };

  const tplFn = templateMap[status];
  if (!tplFn) {
    console.warn(`⚠️ No email template for status: ${status}`);
    return;
  }

  // Add webcam URL to payload for templates that use it
  const extendedPayload = {
    ...payload,
    webcamUrl: payload.printer ? getWebcamStreamUrl(payload.printer) : null,
    username: user.username,
  };

  const tpl = tplFn(extendedPayload);
  await sendEmail(user.email, tpl.subject, tpl.html);
}

module.exports = { notifyUser };
