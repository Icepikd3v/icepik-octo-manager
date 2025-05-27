// services/analyticsService.js

const AnalyticsEvent = require("../models/AnalyticsEvent");

async function logEvent(userId, event, metadata = {}) {
  console.log("📊 logEvent fired:", { userId, event, metadata });

  try {
    const result = await AnalyticsEvent.create({ userId, event, metadata });
    console.log("✅ Analytics saved:", result._id);
    return result;
  } catch (err) {
    console.error("❌ Failed to save analytics event:", err.message);
  }
}

module.exports = { logEvent };
