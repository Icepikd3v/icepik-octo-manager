const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/Users");
const Upload = require("../models/ModelFile");
const PrintJob = require("../models/PrintJob");

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🧹 Connected to MongoDB");

    // Keep the main admin, delete everyone else
    const keepEmail = "icepik09@gmail.com";
    await User.deleteMany({ email: { $ne: keepEmail } });
    console.log("🧍 Users (except admin) removed.");

    // Clear all uploads
    await Upload.deleteMany({});
    console.log("🗑️ Model uploads cleared.");

    // Clear all print jobs
    await PrintJob.deleteMany({});
    console.log("🗑️ Print jobs cleared.");

    console.log("✅ Reset complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Reset failed:", err.message);
    process.exit(1);
  }
};

reset();
