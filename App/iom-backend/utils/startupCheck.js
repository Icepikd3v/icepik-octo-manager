// utils/startupCheck.js

const axios = require("axios");
require("dotenv").config();

const printers = {
  EnderMultiColor: {
    url: `${process.env.OCTOPRINT_BASE_URL}${process.env.OCTOPRINT_MULTICOLOR_PATH}`,
    apiKey: process.env.OCTOPRINT_MULTICOLOR_API_KEY,
  },
  EnderDirect: {
    url: `${process.env.OCTOPRINT_BASE_URL}${process.env.OCTOPRINT_DIRECT_PATH}`,
    apiKey: process.env.OCTOPRINT_DIRECT_API_KEY,
  },
};

const checkEnv = () => {
  const requiredVars = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "OCTOPRINT_BASE_URL",
    "OCTOPRINT_MULTICOLOR_PATH",
    "OCTOPRINT_DIRECT_PATH",
    "OCTOPRINT_MULTICOLOR_API_KEY",
    "OCTOPRINT_DIRECT_API_KEY",
    "WEBCAM_MULTICOLOR",
    "WEBCAM_DIRECT",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "CLIENT_URL",
    "BASE_WEB_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_BRONZE",
    "STRIPE_PRICE_SILVER",
    "STRIPE_PRICE_GOLD",
    "STRIPE_WEBHOOK_SECRET",
    "REACT_APP_STRIPE_PUBLISHABLE_KEY",
    "OCTOPRINT_WEBHOOK_TOKEN",
  ];

  const missingVars = requiredVars.filter((key) => !process.env[key]);
  if (missingVars.length) {
    console.error("❌ Missing environment variables:", missingVars.join(", "));
    process.exit(1);
  }

  console.log("✅ All required .env variables present.");
};

const checkPrinter = async (name, { url, apiKey }) => {
  try {
    const res = await axios.get(`${url}/api/version`, {
      headers: { "X-Api-Key": apiKey },
    });
    console.log(`✅ OctoPrint ${name} reachable: ${res.data.server}`);
  } catch (err) {
    console.error(`❌ Failed to reach ${name}: ${err.message}`);
  }
};

const runAllChecks = async () => {
  checkEnv();

  for (const [name, config] of Object.entries(printers)) {
    await checkPrinter(name, config);
  }

  console.log("📅 Cron jobs scheduled: [8H Reminder, 24H Expiry]");
};

module.exports = {
  runAllChecks,
};
