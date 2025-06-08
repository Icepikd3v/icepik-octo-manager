// server.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { runAllChecks } = require("./utils/startupCheck");

dotenv.config();
const app = express();

// 🔒 Security Headers
app.use(helmet());

// ✅ Stripe Webhooks require raw body parsing
const bodyParser = require("body-parser");
app.use("/api/payment/webhook", bodyParser.raw({ type: "application/json" }));

// 🔧 General Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve Avatars with CORS
const avatarPath = path.join(__dirname, "uploads", "avatars");
app.use(
  "/uploads/avatars",
  express.static(avatarPath, {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// 📘 Swagger API Docs
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
app.use("/api/stream", require("./routes/streamProxy")); // ✅ Stream proxy route
app.use("/api/payment", require("./routes/payment")); // ✅ Payment routes

// ✅ Stripe Webhook Route (must come after raw parser)
const webhookHandler = require("./controllers/webhookController");
app.post("/api/payment/webhook", webhookHandler);

// 🩺 Health Check Endpoint
app.get("/api/status", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

// 🧪 Echo Testing Endpoint
app.post("/api/debug/echo", (req, res) => {
  res.json({ route: "echo", body: req.body });
});

module.exports = app;

// 🚀 Boot Server
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3001;
  connectDB().then(() => {
    app.listen(PORT, async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      await runAllChecks();
    });
  });
}
