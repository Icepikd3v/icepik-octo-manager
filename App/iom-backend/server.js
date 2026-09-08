require("dotenv").config({ path: require("node:path").join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const origin = req.headers.origin;
      const allowed = (process.env.WEB_ORIGINS || "http://127.0.0.1:3002,http://localhost:3002,http://127.0.0.1:3000,http://localhost:3000").split(",");
      if (req.headers["sec-fetch-site"] === "cross-site" || (origin && !allowed.includes(origin))) return res.status(403).json({ message: "Request origin is not allowed." });
    }
    next();
  });
  // Mount before body parsing: OctoPrint receives native JSON, multipart uploads,
  // downloads and SockJS requests unchanged, after site admin authorization.
  app.use(/^\/(ED1|ED2)(?=\/|$)/, require("./middleware/authMiddleware"), require("./middleware/adminMiddleware"), require("./services/octoprintWorkspace").proxyWorkspace);
  app.get(/^\/cam_(ED1|ED2)\/?$/, require("./middleware/authMiddleware"), require("./middleware/adminMiddleware"), (req, res) => require("./services/cameras").streamCamera(req.params[0], req, res));
  app.use(express.json({ limit: "16kb" }));
  app.get("/api/status", (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ success: mongoose.connection.readyState === 1 }));
  app.use("/api/public", require("./routes/public").router);
  app.use("/api/admin", require("./routes/admin"));
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/models", require("./routes/models"));
  app.use("/api/printers", require("./routes/printers"));
  app.use("/api", (req, res) => res.status(404).json({ message: "Endpoint not available." }));
  app.use((err, req, res, next) => res.status(err.status === 400 ? 400 : 500).json({ message: err.status === 400 ? "Invalid request." : "Request failed. Please try again." }));
  return app;
}
if (require.main === module) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("Set a JWT_SECRET of at least 32 characters in the backend .env.");
  connectDB().then(() => {
    require("./services/notificationService").startNotificationWorker();
    const server = createApp().listen(Number(process.env.PORT || 3001), process.env.HOST || "127.0.0.1", () => console.log("IronRoot workspace API listening"));
    require("./services/octoprintWorkspace").attachWorkspaceUpgrade(server);
  });
}
module.exports = { createApp };
