const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("./serve-production.cjs");
let server, base;
before(async () => {
  server = createServer({ apiPort: 1 });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});
test("public deep links serve the compiled website with security headers", async () => {
  for (const route of [
    "/",
    "/services",
    "/contact",
    "/work/custom-prints",
    "/3d-printing",
    "/login",
    "/signup",
    "/dashboard",
    "/live",
    "/upload",
    "/file-library",
  ]) {
    const res = await fetch(base + route);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /IronRoot Solutions/);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.match(
      res.headers.get("content-security-policy"),
      /frame-ancestors 'none'/,
    );
  }
});
test("missing paths return 404 and API downtime returns JSON", async () => {
  for (const route of [
    "/work/unknown",
    "/static/missing.js",
  ]) {
    const res = await fetch(base + route);
    assert.equal(res.status, 404, route);
  }
  const offline = await fetch(base + "/api/status");
  assert.equal(offline.status, 503);
  assert.match((await offline.json()).message, /unavailable/);
  const res = await fetch(base + "/contact", { method: "POST", body: "test" });
  assert.equal(res.status, 405);
});
test("compiled JS excludes mock workspace and assets are cacheable", async () => {
  const html = await (await fetch(base)).text();
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)];
  assert.ok(scripts.length);
  for (const [, src] of scripts) {
    const res = await fetch(base + src);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("cache-control"), /immutable/);
    const js = await res.text();
    assert.doesNotMatch(
      js,
      /Explore demo workspace|Print workspace preview|Added to your demo library/,
    );
  }
  const icon = await fetch(base + "/ironroot-mark.svg");
  assert.equal(icon.status, 200);
  assert.equal(icon.headers.get("content-type"), "image/svg+xml");
});

test("same-origin API proxy preserves sessions, request bodies, and status codes", async () => {
  const http = require("node:http");
  const upstream = http.createServer((req, res) => {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      res.writeHead(201, { "Content-Type": "application/json", "Set-Cookie": "ironroot_session=test; HttpOnly; Path=/api; SameSite=Strict", "Cache-Control": "no-store" });
      res.end(JSON.stringify({ method: req.method, path: req.url, cookie: req.headers.cookie, body, contentType: req.headers["content-type"] }));
    });
  });
  await new Promise(resolve => upstream.listen(0, "127.0.0.1", resolve));
  const proxy = createServer({ apiPort: upstream.address().port });
  await new Promise(resolve => proxy.listen(0, "127.0.0.1", resolve));
  try {
    const form = new FormData();
    form.append("printer", "ED2");
    form.append("file", new Blob(["; test file"]), "test.gcode");
    const response = await fetch(`http://127.0.0.1:${proxy.address().port}/api/models/upload`, { method: "POST", headers: { Cookie: "ironroot_session=test" }, body: form });
    assert.equal(response.status, 201);
    assert.match(response.headers.get("set-cookie"), /HttpOnly/);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const data = await response.json();
    assert.equal(data.method, "POST"); assert.equal(data.path, "/api/models/upload");
    assert.equal(data.cookie, "ironroot_session=test");
    assert.match(data.contentType, /multipart\/form-data/);
    assert.match(data.body, /test.gcode/); assert.match(data.body, /; test file/);
  } finally {
    proxy.closeAllConnections(); upstream.closeAllConnections();
    await Promise.all([new Promise(resolve => proxy.close(resolve)), new Promise(resolve => upstream.close(resolve))]);
  }
});
