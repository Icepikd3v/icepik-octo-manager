// Serves the compiled website and proxies same-origin workspace requests to the local API.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { pipeline } = require("node:stream");
const build = path.resolve(__dirname, "../build");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
};
const pages = new Set([
  "/",
  "/services",
  "/work",
  "/about",
  "/contact",
  "/3d-printing",
  "/login",
  "/signup",
  "/dashboard",
  "/live",
  "/upload",
  "/file-library",
  "/dev",
]);
const projects = new Set([
  "custom-prints",
  "board-repair",
  "laptop-repair",
  "dashcam",
  "five-boards",
]);
function createServer({ apiPort = Number(process.env.API_PORT || 3001) } = {}) {
  return http.createServer((req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    );
    if (req.url.startsWith("/api/")) {
      const upstream = http.request({
        hostname: "127.0.0.1", port: apiPort, path: req.url,
        method: req.method, headers: { ...req.headers, host: `127.0.0.1:${apiPort}` },
      }, response => {
        res.writeHead(response.statusCode, response.headers);
        pipeline(response, res, () => {});
      });
      upstream.setTimeout(130000, () => upstream.destroy(new Error("API timeout")));
      upstream.on("error", () => {
        if (!res.headersSent) {
          res.writeHead(503, { "Content-Type": "application/json", "Cache-Control": "no-store" });
          res.end(JSON.stringify({ message: "The workspace service is unavailable. Please try again shortly." }));
        } else res.destroy();
      });
      req.on("aborted", () => upstream.destroy());
      req.pipe(upstream);
      return;
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end("Method not allowed");
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      res.writeHead(400);
      res.end("Invalid URL");
      return;
    }
    const file = path.resolve(build, "." + pathname);
    if (
      (!file.startsWith(build + path.sep) && file !== build) ||
      pathname.includes("\0")
    ) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.stat(file, (err, stat) => {
      if (!err && stat.isFile()) {
        send(file, 200);
        return;
      }
      if (path.extname(pathname) || pathname.startsWith("/api/")) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const route = pathname.replace(/\/$/, "") || "/";
      const known =
        pages.has(route) ||
        (route.startsWith("/work/") && projects.has(route.slice(6)));
      send(path.join(build, "index.html"), known ? 200 : 404);
    });
    function send(target, status) {
      const stream = fs.createReadStream(target);
      stream.once("open", () => {
        const html = path.extname(target) === ".html";
        res.writeHead(status, {
          "Content-Type":
            types[path.extname(target)] || "application/octet-stream",
          "Cache-Control": html
            ? "no-cache"
            : target.includes(path.sep + "static" + path.sep)
              ? "public, max-age=31536000, immutable"
              : "public, max-age=3600",
        });
        if (req.method === "HEAD") {
          stream.destroy();
          res.end();
          return;
        }
        pipeline(stream, res, () => {});
      });
      stream.once("error", () => {
        if (!res.headersSent) {
          res.writeHead(503);
          res.end("Build unavailable. Run npm run build first.");
        }
      });
    }
  });
}
if (require.main === module) {
  if (!fs.existsSync(path.join(build, "index.html"))) {
    console.error("Run npm run build before starting the production preview.");
    process.exit(1);
  }
  const port = Number(process.env.PORT || 3002);
  const host = process.env.HOST || "127.0.0.1";
  const server = createServer();
  server.on("error", (err) => {
    console.error(err.message);
    process.exit(1);
  });
  server.listen(port, host, () =>
    console.log(`IronRoot production preview: http://${host}:${port}`),
  );
}
module.exports = { createServer };
