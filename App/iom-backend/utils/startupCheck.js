// utils/startupCheck.js
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

function checkEnvVariables() {
  const requiredVars = [
    "MONGO_URI",
    "JWT_SECRET",
    "OCTOPRINT_URL_MULTI",
    "OCTOPRINT_URL_DIRECT",
    "OCTOPRINT_API_KEY_MULTI",
    "OCTOPRINT_API_KEY_DIRECT",
    "SMTP_USER",
    "SMTP_PASS",
    "BASE_WEB_URL",
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing.join(", "));
    process.exit(1);
  }

  console.log("✅ All required .env variables present.");
}

async function checkMongoConnection() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB connected.");
    } else {
      throw new Error("MongoDB not connected.");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

async function checkOctoPrint() {
  const printers = [
    {
      name: "EnderMultiColor",
      url: process.env.OCTOPRINT_URL_MULTI,
      apiKey: process.env.OCTOPRINT_API_KEY_MULTI,
    },
    {
      name: "EnderDirect",
      url: process.env.OCTOPRINT_URL_DIRECT,
      apiKey: process.env.OCTOPRINT_API_KEY_DIRECT,
    },
  ];

  for (const printer of printers) {
    try {
      const res = await axios.get(`${printer.url}/api/version`, {
        headers: { "X-Api-Key": printer.apiKey },
        timeout: 3000,
      });
      console.log(`✅ OctoPrint ${printer.name} reachable: ${res.data.text}`);
    } catch (err) {
      console.error(`❌ OctoPrint ${printer.name} unreachable:`, err.message);
    }
  }
}

async function runAllChecks() {
  checkEnvVariables();
  await checkMongoConnection();
  await checkOctoPrint();
}

module.exports = { runAllChecks };
