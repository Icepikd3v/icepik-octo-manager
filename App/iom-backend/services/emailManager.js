// services/emailManager.js
const { sendEmail } = require("./emailService");
const templates = require("./emailTemplates");
const { getWebcamStreamUrl } = require("./octoprintManager");

/**
 * Notify a user based on the print job status or OctoPrint event.
 * @param {string} status - Status like 'started', 'print_done', 'print_failed', etc.
 * @param {Object|String} user - User object or user ID
 * @param {Object} payload - { printer, filename, trackingUrl, etc. }
 */
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

module.exports = { notifyUser };
