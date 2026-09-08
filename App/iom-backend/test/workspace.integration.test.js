const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const mongoose = require("mongoose");
const { createApp } = require("../server");
const ModelFile = require("../models/ModelFile");
let server, base, cookie, otherCookie;
const database = `ironroot_workspace_test_${randomUUID().replaceAll("-", "")}`;
const password = "Workspace-test-password-123";
const request = (route, options = {}) => fetch(base + route, options);
const post = (route, body, session) => request(route, { method: "POST", headers: { "Content-Type": "application/json", ...(session ? { Cookie: session } : {}) }, body: JSON.stringify(body) });
before(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: database });
  server = createApp().listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  for (const file of await ModelFile.find({})) await fs.unlink(path.join(__dirname, "../uploads", file.filename)).catch(() => {});
  assert.equal(mongoose.connection.name, database);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
});
test("protected data rejects unauthenticated requests and old demo tokens", async () => {
  for (const route of ["/models", "/printers", "/auth/me"]) {
    assert.equal((await request(route)).status, 401);
    assert.equal((await request(route, { headers: { Authorization: "Bearer frontend-demo-token" } })).status, 401);
  }
});
test("registration validates input and creates an HttpOnly session", async () => {
  assert.equal((await post("/auth/register", { username: "Sam", email: { $gt: "" }, password })).status, 400);
  const response = await post("/auth/register", { username: "Workspace Test", email: "test@example.test", password });
  assert.equal(response.status, 201);
  const header = response.headers.get("set-cookie");
  assert.match(header, /HttpOnly/); assert.match(header, /SameSite=Strict/);
  cookie = header.split(";")[0];
  const data = await response.json();
  assert.equal(data.user.username, "Workspace Test");
  assert.equal(data.token, undefined);
  assert.equal(data.user.password, undefined);
  assert.equal((await request("/auth/me", { headers: { Cookie: cookie } })).status, 200);
});
test("login rejects wrong passwords and normalizes email", async () => {
  assert.equal((await post("/auth/login", { email: "test@example.test", password: "wrong-password" })).status, 401);
  assert.equal((await post("/auth/login", { email: "TEST@example.test", password })).status, 200);
  assert.equal((await post("/auth/login", { email: { $ne: null }, password })).status, 400);
});
test("uploads persist exact contents and remain private to their owner", async () => {
  const contents = "; Integration test only. No hardware commands.\n";
  const form = new FormData(); form.append("printer", "ED2"); form.append("file", new Blob([contents]), "workspace-test.gcode");
  const uploaded = await request("/models/upload", { method: "POST", headers: { Cookie: cookie }, body: form });
  assert.equal(uploaded.status, 201);
  const { file } = await uploaded.json();
  assert.equal(file.printer, "ED2"); assert.equal(file.status, "ready");
  assert.equal(await fs.readFile(path.join(__dirname, "../uploads", file.filename), "utf8"), contents);
  const mine = await (await request("/models", { headers: { Cookie: cookie } })).json();
  assert.equal(mine.length, 1); assert.equal(mine[0].size, Buffer.byteLength(contents));
  const other = await post("/auth/register", { username: "Other Test", email: "other@example.test", password });
  otherCookie = other.headers.get("set-cookie").split(";")[0];
  assert.deepEqual(await (await request("/models", { headers: { Cookie: otherCookie } })).json(), []);
});
test("invalid uploads and cross-origin writes are rejected", async () => {
  for (const [printer, filename] of [["unknown", "test.gcode"], ["ED1", "test.exe"]]) {
    const form = new FormData(); form.append("printer", printer); form.append("file", new Blob(["test"]), filename);
    assert.equal((await request("/models/upload", { method: "POST", headers: { Cookie: cookie }, body: form })).status, 400);
  }
  assert.equal((await request("/auth/logout", { method: "POST", headers: { Origin: "https://foreign.example" } })).status, 403);
});
test("live status reads ED1 and ED2 without exposing keys or host addresses", async () => {
  const response = await request("/printers", { headers: { Cookie: cookie } });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data.printers.map(p => p.id), ["ED1", "ED2"]);
  for (const printer of data.printers) {
    assert.equal(typeof printer.connected, "boolean");
    assert.equal(printer.reachable, true, `${printer.id} must respond to the live check`);
    console.log(`${printer.id}: ${printer.state}`);
  }
  const text = JSON.stringify(data);
  assert.doesNotMatch(text, /192\.168\.1\.34|apiKey|X-Api-Key/);
  assert.ok(!text.includes(process.env.OCTOPRINT_ED1_API_KEY));
  assert.ok(!text.includes(process.env.OCTOPRINT_ED2_API_KEY));
});
test("legacy print, email, user listing and analytics routes are not exposed", async () => {
  for (const route of ["/print-jobs", "/print/start", "/test-email", "/users", "/analytics"]) assert.equal((await post(route, {}, cookie)).status, 404);
});
test("logout clears the session cookie", async () => {
  const response = await post("/auth/logout", {}, cookie);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /ironroot_session=;/);
  assert.equal((await request("/auth/me")).status, 401);
});
