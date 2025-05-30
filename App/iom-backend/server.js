// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const analyticsRoutes = require("./routes/analytics"); // ✅ new
// Load env variables FIRST
dotenv.config();

const connectDB = require("./config/db");
connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const modelRoutes = require("./routes/models");
const printJobRoutes = require("./routes/printJobs");
const printerRoutes = require("./routes/printers");
const userRoutes = require("./routes/users");
const testEmailRoutes = require("./routes/testEmail"); // Test-email endpoint

app.use("/api/auth", authRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/print-jobs", printJobRoutes);
app.use("/api/printers", printerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/test-email", testEmailRoutes);
app.use("/api/analytics", analyticsRoutes); // ✅ mount route
// API status check
app.get("/api/status", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
