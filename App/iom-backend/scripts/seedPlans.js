// scripts/seedPlans.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Plan = require("../models/Plan");

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    await Plan.deleteMany({});
    await Plan.insertMany([
      {
        name: "basic",
        maxPrintsPerMonth: 0,
        price: 0,
        features: ["View-only access"],
      },
      {
        name: "bronze",
        maxPrintsPerMonth: 1,
        price: 4.99,
        features: ["1 print per month"],
      },
      {
        name: "silver",
        maxPrintsPerMonth: 5,
        price: 9.99,
        features: ["5 prints per month", "Priority queue"],
      },
      {
        name: "gold",
        maxPrintsPerMonth: -1,
        price: 19.99,
        features: ["Unlimited prints", "Live support", "Admin tools"],
      },
    ]);
    console.log("✅ Plans seeded");
  } catch (err) {
    console.error("❌ Plan seeding failed:", err.message);
  } finally {
    mongoose.disconnect();
  }
});
