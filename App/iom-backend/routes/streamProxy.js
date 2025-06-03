const express = require("express");
const http = require("http");
const https = require("https");
const dotenv = require("dotenv");
const { URL } = require("url");

dotenv.config();
const router = express.Router();

const streamMap = {
  EnderMultiColor: process.env.STREAM_URL_MULTI,
  EnderDirect: process.env.STREAM_URL_DIRECT,
};

router.get("/:printer", (req, res) => {
  const printer = req.params.printer;
  const streamUrl = streamMap[printer];

  if (!streamUrl) {
    return res.status(400).json({ error: "Unknown printer" });
  }

  const parsedUrl = new URL(streamUrl);
  const lib = parsedUrl.protocol === "https:" ? https : http;

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
    path: parsedUrl.pathname + parsedUrl.search,
    method: "GET",
    headers: {
      "User-Agent": "IOM-Proxy",
    },
  };

  const proxyReq = lib.request(options, (proxyRes) => {
    res.setHeader(
      "Content-Type",
      proxyRes.headers["content-type"] || "multipart/x-mixed-replace",
    );
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error("Proxy MJPEG error:", err.message);
    res.status(500).send("Stream proxy error");
  });

  proxyReq.end();
});

module.exports = router;
