const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("./serve-production.cjs");
let server, base;
before(async () => {
  server = createServer();
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
test("private, missing and API paths do not appear to be working public routes", async () => {
  for (const route of [
    "/dev",
    "/dashboard",
    "/work/unknown",
    "/static/missing.js",
    "/api/status",
  ]) {
    const res = await fetch(base + route);
    assert.equal(res.status, 404, route);
  }
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
