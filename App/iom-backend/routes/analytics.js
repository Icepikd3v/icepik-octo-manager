// routes/analytics.js
const express = require("express");
const router = express.Router();
const AnalyticsEvent = require("../models/AnalyticsEvent");
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const User = require("../models/Users");
const { Parser } = require("json2csv");

// GET /api/analytics — latest events with optional filters and pagination
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const { from, to, event, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }
    if (event) {
      query.event = event;
    }

    const events = await AnalyticsEvent.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(events);
  } catch (err) {
    console.error("❌ Failed to fetch analytics:", err.message);
    res.status(500).json({ message: "Failed to load analytics" });
  }
});

// GET /api/analytics/summary
router.get("/summary", auth, adminOnly, async (req, res) => {
  try {
    const { from, to } = req.query;
    const timeFilter = {};
    if (from) timeFilter.$gte = new Date(from);
    if (to) timeFilter.$lte = new Date(to);

    const baseMatch = Object.keys(timeFilter).length
      ? { timestamp: timeFilter }
      : {};

    const totalEvents = await AnalyticsEvent.countDocuments(baseMatch);
    const uploadEvents = await AnalyticsEvent.countDocuments({
      ...baseMatch,
      event: "file_upload",
    });
    const uniqueUsers = await AnalyticsEvent.distinct("userId", baseMatch);

    const printerCounts = await AnalyticsEvent.aggregate([
      { $match: { ...baseMatch, "metadata.printer": { $exists: true } } },
      { $group: { _id: "$metadata.printer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    res.json({
      totalEvents,
      uploadEvents,
      uniqueUsers: uniqueUsers.length,
      mostUsedPrinter: printerCounts[0]?._id || "N/A",
    });
  } catch (err) {
    console.error("❌ Analytics summary error:", err.message);
    res.status(500).json({ message: "Failed to load summary" });
  }
});

// GET /api/analytics/top-users
router.get("/top-users", auth, adminOnly, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const results = await AnalyticsEvent.aggregate([
      { $match: { event: "file_upload" } },
      { $group: { _id: "$userId", uploads: { $sum: 1 } } },
      { $sort: { uploads: -1 } },
      { $limit: parseInt(limit) },
    ]);

    const enriched = await Promise.all(
      results.map(async (r) => {
        const user = await User.findById(r._id).select("username email");
        return {
          userId: r._id,
          username: user?.username || "unknown",
          email: user?.email || "hidden",
          uploads: r.uploads,
        };
      }),
    );

    res.json(enriched);
  } catch (err) {
    console.error("❌ Top users error:", err);
    res.status(500).json({ message: "Failed to fetch top users" });
  }
});

// GET /api/analytics/breakdown
router.get("/breakdown", auth, adminOnly, async (req, res) => {
  try {
    const events = await AnalyticsEvent.find();

    const eventCounts = {};
    const uniqueUserIds = new Set();
    const printerUsage = {};
    const dailyCounts = {};

    for (const evt of events) {
      eventCounts[evt.event] = (eventCounts[evt.event] || 0) + 1;
      uniqueUserIds.add(evt.userId.toString());

      const printer = evt.metadata?.printer;
      if (printer) {
        printerUsage[printer] = (printerUsage[printer] || 0) + 1;
      }

      const day = new Date(evt.timestamp).toISOString().split("T")[0];
      dailyCounts[day] = dailyCounts[day] || {};
      dailyCounts[day][evt.event] = (dailyCounts[day][evt.event] || 0) + 1;
    }

    let mostUsedPrinter = null;
    let maxPrints = 0;
    for (const [printer, count] of Object.entries(printerUsage)) {
      if (count > maxPrints) {
        maxPrints = count;
        mostUsedPrinter = printer;
      }
    }

    res.json({
      ...eventCounts,
      uniqueUsers: uniqueUserIds.size,
      mostUsedPrinter,
      byDate: dailyCounts,
    });
  } catch (err) {
    console.error("❌ Breakdown error:", err);
    res.status(500).json({ message: "Failed to compute breakdown" });
  }
});

// GET /api/analytics/daily — Daily rollups by event type
router.get("/daily", auth, adminOnly, async (req, res) => {
  try {
    const events = await AnalyticsEvent.find();
    const map = new Map();

    for (const evt of events) {
      const day = new Date(evt.timestamp).toISOString().split("T")[0];
      if (!map.has(day)) map.set(day, {});
      const dayObj = map.get(day);
      dayObj[evt.event] = (dayObj[evt.event] || 0) + 1;
    }

    const dailyList = Array.from(map.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    res.json(dailyList);
  } catch (err) {
    console.error("❌ Daily stats error:", err);
    res.status(500).json({ message: "Failed to compute daily stats" });
  }
});

// GET /api/analytics/per-user — Grouped events per user
router.get("/per-user", auth, adminOnly, async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$userId",
          events: { $push: "$event" },
        },
      },
    ];

    const grouped = await AnalyticsEvent.aggregate(pipeline);

    const enriched = await Promise.all(
      grouped.map(async (entry) => {
        const user = await User.findById(entry._id).select("username email");
        const counts = {};
        entry.events.forEach((e) => (counts[e] = (counts[e] || 0) + 1));

        return {
          userId: entry._id,
          username: user?.username || "unknown",
          email: user?.email || "hidden",
          events: counts,
        };
      }),
    );

    res.json(enriched);
  } catch (err) {
    console.error("❌ Per-user stats error:", err);
    res.status(500).json({ message: "Failed to compute per-user stats" });
  }
});

// GET /api/analytics/audit/:jobId — Full timeline for a print job
router.get("/audit/:jobId", auth, adminOnly, async (req, res) => {
  try {
    const { jobId } = req.params;
    const events = await AnalyticsEvent.find({ "metadata.jobId": jobId }).sort({
      timestamp: 1,
    });
    res.json(events);
  } catch (err) {
    console.error("❌ Audit log error:", err);
    res.status(500).json({ message: "Failed to fetch audit timeline" });
  }
});

// GET /api/analytics/export
router.get("/export", auth, adminOnly, async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const events = await AnalyticsEvent.find(query).lean();
    const fields = [
      "userId",
      "event",
      "metadata.filename",
      "metadata.printer",
      "timestamp",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(events);

    res.setHeader("Content-Disposition", "attachment; filename=analytics.csv");
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
  } catch (err) {
    console.error("❌ Export error:", err);
    res.status(500).json({ message: "Failed to export data" });
  }
});

module.exports = router;
