const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Printer = require("../models/Printer");

dotenv.config(); // Loads MONGO_URI from .env

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    await Printer.deleteMany({});
    await Printer.insertMany([
      { name: "EnderDirect" },
      { name: "EnderMultiColor" },
    ]);
    console.log("✅ Printer data seeded");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    mongoose.disconnect();
  }
});
