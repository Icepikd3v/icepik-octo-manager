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

test('upload receipts queue once, retry failures, and never resend successful deliveries', async () => {
  const Notification = require('../models/EmailNotification');
  const { collectNotifications, deliverNext } = require('../services/notificationService');
  await Notification.init();
  await collectNotifications(); await collectNotifications();
  assert.equal(await Notification.countDocuments(), 1);
  let receipt = await Notification.findOne();
  assert.equal(receipt.to, 'test@example.test');
  assert.match(receipt.text, /workspace-test.gcode/);
  let attempts = 0;
  const offline = async () => { attempts++; const error = new Error('private SMTP details'); error.code = 'ECONNECTION'; throw error; };
  const now = new Date();
  await deliverNext(offline, now);
  receipt = await Notification.findOne();
  assert.equal(receipt.status, 'pending'); assert.equal(receipt.attempts, 1);
  assert.equal(receipt.lastError, 'ECONNECTION');
  assert.equal(await deliverNext(offline, now), false);
  await deliverNext(async message => { attempts++; assert.equal(message.to, 'test@example.test'); return { messageId: 'mock-only' }; }, receipt.availableAt);
  assert.equal((await Notification.findOne()).status, 'sent');
  assert.equal(await deliverNext(offline, new Date(Date.now() + 86400000)), false);
  assert.equal(attempts, 2);
});
test('only enrolled print jobs queue lifecycle updates and exhausted delivery attempts stop', async () => {
  const Notification = require('../models/EmailNotification');
  const PrintJob = require('../models/PrintJob');
  const User = require('../models/Users');
  const { collectNotifications, deliverNext } = require('../services/notificationService');
  const user = await User.findOne({ email: 'test@example.test' });
  const job = await PrintJob.create({ userId: user._id, filename: 'owned-part.stl', printer: 'ED1' });
  await collectNotifications(); assert.equal(await Notification.countDocuments(), 1);
  job.notifyCustomer = true; await job.save();
  await collectNotifications(); await collectNotifications();
  assert.equal(await Notification.countDocuments(), 2);
  job.status = 'printing'; await job.save(); await collectNotifications();
  assert.equal(await Notification.countDocuments(), 3);
  assert.match((await Notification.findOne({ eventKey: `job:${job._id}:printing` })).text, /Printing has started/);
  const failure = async () => { throw new Error('SMTP secret must not be persisted'); };
  for (let i = 0; i < 5; i++) await deliverNext(failure, new Date(Date.now() + (i + 1) * 86400000));
  const failed = await Notification.findOne({ eventKey: `job:${job._id}:queued` });
  assert.equal(failed.status, 'failed'); assert.equal(failed.attempts, 5);
  assert.equal(failed.lastError, 'DELIVERY_FAILED');
});


test("credential validation rejects duplicate accounts and unsafe password lengths", async () => {
  assert.equal((await post("/auth/register", { username: "Duplicate", email: "TEST@example.test", password })).status, 409);
  for (const invalid of ["short", "x".repeat(73), "🔒".repeat(19)]) {
    assert.equal((await post("/auth/register", { username: "Invalid Password", email: "invalid@example.test", password: invalid })).status, 400);
  }
  assert.equal((await post("/auth/login", { email: "missing@example.test", password })).status, 401);
  const response = await post("/auth/login", { email: "  TEST@example.test  ", password });
  assert.equal(response.status, 200);
  const session = response.headers.get("set-cookie").split(";")[0];
  assert.equal((await request("/auth/me", { headers: { Cookie: session } })).status, 200);
  const user = await require("../models/Users").findOne({ email: "test@example.test" });
  assert.notEqual(user.password, password);
  assert.equal(await require("bcryptjs").compare(password, user.password), true);
  assert.equal(user.isAdmin, false);
});
test("expired, tampered and deleted-account sessions cannot open private data", async () => {
  const jwt = require("jsonwebtoken");
  const User = require("../models/Users");
  const user = await User.findOne({ email: "test@example.test" });
  const expired = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: -1 });
  const missing = jwt.sign({ id: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET, { expiresIn: "1h" });
  for (const token of [expired, missing, "tampered.session.token"]) {
    for (const route of ["/auth/me", "/models", "/printers"]) {
      assert.equal((await request(route, { headers: { Cookie: `ironroot_session=${token}` } })).status, 401);
    }
  }
});
