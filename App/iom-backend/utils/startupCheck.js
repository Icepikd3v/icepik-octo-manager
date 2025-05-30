// utils/startupCheck.js
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

function checkEnvVariables() {
  const requiredVars = [
    "MONGO_URI",
    "JWT_SECRET",
    "OCTOPRINT_BASE_URL",
    "OCTOPRINT_API_KEY",
    "OCTOPRINT_DIRECT_PATH",
    "OCTOPRINT_MULTICOLOR_PATH",
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
  const base = process.env.OCTOPRINT_BASE_URL;
  const apiKey = process.env.OCTOPRINT_API_KEY;
  const printers = [
    { name: "EnderDirect", path: process.env.OCTOPRINT_DIRECT_PATH },
    { name: "EnderMultiColor", path: process.env.OCTOPRINT_MULTICOLOR_PATH },
  ];

  for (const printer of printers) {
    const url = `${base}${printer.path}/api/version`;
    try {
      const res = await axios.get(url, {
        headers: { "X-Api-Key": apiKey },
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
