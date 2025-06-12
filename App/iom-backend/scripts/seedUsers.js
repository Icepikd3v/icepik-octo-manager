// scripts/seedUsers.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash("TestPass123!", 10);

    await User.insertMany([
      {
        username: "icepiktest",
        email: "icepik09@gmail.com", // ← your real/testable email
        password: hashedPassword,
        subscriptionTier: "gold",
        isAdmin: true,
        isVerified: true,
      },
      {
        username: "regularUser",
        email: "user@example.com",
        password: hashedPassword,
        subscriptionTier: "silver",
        isAdmin: false,
        isVerified: true,
      },
    ]);

    console.log("✅ Users seeded");
  } catch (err) {
    console.error("❌ User seeding failed:", err.message);
  } finally {
    mongoose.disconnect();
  }
});
