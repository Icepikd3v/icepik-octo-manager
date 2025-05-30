// utils/subscriptionAccess.js
const PrintJob = require("../models/PrintJob");

const limits = {
  basic: 0,
  bronze: 1,
  silver: 5,
  gold: Infinity,
};

/**
 * Determine if a user is allowed to start a print now based on tier and printer availability.
 * Enforces monthly print limits and printer availability.
 * @param {Object} user - User document
 * @param {string} printer - Target printer name
 * @returns {Promise<boolean>}
 */
async function canStartPrintNow(user, printer) {
  const tier = user.subscriptionTier || "basic";
  const limit = limits[tier];

  if (!limit || limit <= 0) return false;

  // Count prints started by user this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyPrints = await PrintJob.countDocuments({
    userId: user._id,
    startedAt: { $gte: startOfMonth },
  });

  if (monthlyPrints >= limit) return false;

  // Only allow if printer is not already in use
  const activeCount = await PrintJob.countDocuments({
    printer,
    status: "printing",
  });

  return activeCount === 0;
}

module.exports = { canStartPrintNow };
