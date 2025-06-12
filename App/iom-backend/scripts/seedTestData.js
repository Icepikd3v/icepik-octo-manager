const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/Users");
const Upload = require("../models/ModelFile"); // Correct model
const PrintJob = require("../models/PrintJob");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Create Admin User (or find existing)
    const adminExists = await User.findOne({ email: "icepik09@gmail.com" });
    const admin =
      adminExists ||
      (await User.create({
        username: "icepiktest",
        email: "icepik09@gmail.com",
        password: await bcrypt.hash("NewSecurePass123!", 10),
        isAdmin: true,
        isVerified: true,
        subscriptionTier: "gold",
      }));
    console.log("👤 Admin user ready:", admin.email);

    // 2. Create Regular User
    const regular = await User.create({
      username: "testuser",
      email: "testuser@example.com",
      password: await bcrypt.hash("Test1234!", 10),
      isAdmin: false,
      isVerified: true,
      subscriptionTier: "bronze",
    });
    console.log("👤 Regular user created:", regular.email);

    // 3. Create Uploaded File Entry (ModelFile)
    const uploadedFile = await Upload.create({
      name: "demo_model.gcode",
      filename: "demo_model-1748888888888-111111111.gcode",
      userId: admin._id,
      status: "sent",
      printer: "EnderDirect",
    });
    console.log("📁 Upload created:", uploadedFile.filename);

    // 4. Create Print Job
    const printJob = await PrintJob.create({
      userId: admin._id,
      filename: uploadedFile.filename,
      printer: "EnderDirect",
      status: "queued",
    });
    console.log("🖨️ Print job queued:", printJob._id);

    console.log("✅ Seed complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
