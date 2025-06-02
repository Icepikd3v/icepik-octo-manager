// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const { runAllChecks } = require("./utils/startupCheck");

const app = express();

// 🔒 Security
app.use(helmet());

// 🔧 Middleware
app.use(cors());
app.use(express.json());

// 📘 Swagger Docs
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ✅ API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/models", require("./routes/uploads"));
app.use("/api/print-jobs", require("./routes/printJobs"));
app.use("/api/printers", require("./routes/printers"));
app.use("/api/print", require("./routes/print"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/users", require("./routes/users"));
app.use("/api/test-email", require("./routes/testEmail"));
app.use("/api/webhooks", require("./routes/webhooks")); // OctoPrint webhooks

// 🩺 Health check
app.get("/api/status", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

// 🧪 Manual testing route
app.post("/api/debug/echo", (req, res) => {
  res.json({ route: "echo", body: req.body });
});

module.exports = app;

// 🚀 Start server only if not in test mode
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3001;
  connectDB().then(() => {
    app.listen(PORT, async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      await runAllChecks();
    });
  });
}
