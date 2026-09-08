require("dotenv").config({ path: require("node:path").join(__dirname, "../.env") });
const { verifyEmail } = require("../services/emailService");
Promise.resolve().then(verifyEmail).then(() => {
  console.log("Gmail SMTP authentication verified. No email was sent.");
}).catch(error => {
  const browserCheck = error.response?.includes("WebLoginRequired");
  console.error("Gmail verification failed:", error.code || "NOT_CONFIGURED",
    browserCheck ? "Google requires a browser sign-in/security check for this account before SMTP authentication (WebLoginRequired)." : "Check SMTP_USER and SMTP_PASS in the backend .env.");
  process.exitCode = 1;
});
