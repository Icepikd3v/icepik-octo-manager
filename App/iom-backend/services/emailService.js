const nodemailer = require("nodemailer");

function emailConfigured(env = process.env) {
  return Boolean(env.SMTP_USER && env.SMTP_PASS);
}
function emailEnabled(env = process.env) {
  return env.EMAIL_ENABLED === "true" && emailConfigured(env);
}
function createEmailService({ env = process.env, createTransport = nodemailer.createTransport } = {}) {
  let transport;
  function getTransport() {
    if (!emailConfigured(env)) throw new Error("Set SMTP_USER and a Gmail app password in SMTP_PASS.");
    if (!transport) transport = createTransport({
      host: "smtp.gmail.com", port: 465, secure: true,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS.replace(/\s/g, "") },
      connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 30000,
      disableFileAccess: true, disableUrlAccess: true,
    });
    return transport;
  }
  return {
    verify: () => getTransport().verify(),
    async send({ to, subject, html, text, messageId }) {
      if (!emailEnabled(env)) throw new Error("Automatic email is disabled or not configured.");
      const result = await getTransport().sendMail({
        from: { name: "IronRoot Solutions", address: env.SMTP_USER },
        replyTo: env.SMTP_USER, to, subject, html, text, messageId,
        disableFileAccess: true, disableUrlAccess: true,
      });
      if (!result.accepted?.length || result.rejected?.length) throw new Error("SMTP did not accept the recipient.");
      return { messageId: result.messageId };
    },
  };
}
const service = createEmailService();
// Compatibility for unmounted legacy callers; failures deliberately propagate.
const sendEmail = (to, subject, html, text) => service.send({ to, subject, html, text });
module.exports = { emailConfigured, emailEnabled, createEmailService, sendEmail, sendNotification: service.send, verifyEmail: service.verify };
