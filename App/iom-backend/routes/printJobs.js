const express = require("express");
const router = express.Router();
const PrintJob = require("../models/PrintJob");
//// At the top of routes/printJobs.js
//router.get("/test", (req, res) => {
//  res.json({ message: "✅ printJobs route connected" });
//});
// POST a new print job
router.post("/", async (req, res) => {
  try {
    const newJob = await PrintJob.create(req.body);
    res.status(201).json(newJob);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all print jobs (expand later with auth)
router.get("/", async (req, res) => {
  try {
    const jobs = await PrintJob.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
