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
async function verifyTestAccount(email) {
  const Notification = require("../models/EmailNotification");
  const message = await Notification.findOne({ to: email, eventKey: /^verification:/ });
  assert.ok(message);
  const token = message.text.match(/#token=([a-f0-9]{64})/)[1];
  const code = message.text.match(/Enter this code: (\d{6})/)[1];
  const response = await post("/auth/verify-email", { token, code });
  assert.equal((await post("/auth/verify-email", { token, code })).status, 400, "verification is one-time");
  await Notification.deleteOne({ _id: message._id });
  return response;
}
before(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: database });
  server = createApp().listen(0, "127.0.0.1");
  require("../services/octoprintWorkspace").attachWorkspaceUpgrade(server);
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
  const registration = await post("/auth/register", { username: "Workspace Test", email: "test@example.test", password });
  assert.equal(registration.status, 202);
  assert.equal(registration.headers.get("set-cookie"), null);
  assert.equal((await post("/auth/login", { email: "test@example.test", password })).status, 403);
  const response = await verifyTestAccount("test@example.test");
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
  await post("/auth/register", { username: "Other Test", email: "other@example.test", password });
  const other = await verifyTestAccount("other@example.test");
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


test("public cameras expose only active filenames and no printer secrets", async () => {
  const response = await request("/public/printers");
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data.printers.map(p => p.id), ["ED1", "ED2"]);
  assert.doesNotMatch(JSON.stringify(data), /192\.168|apiKey|X-Api-Key/);
  for (const printer of data.printers) if (printer.state !== "Printing") assert.equal(printer.job?.filename, undefined);
  assert.equal((await request("/public/cameras/unknown")).status, 404);
});
test("admin endpoints reject guests and members, and only admin settings persist", async () => {
  for (const route of ["/admin/overview", "/admin/printers/ED1/files"]) {
    assert.equal((await request(route)).status, 401);
    assert.equal((await request(route, { headers: { Cookie: otherCookie } })).status, 403);
  }
  assert.equal((await post("/admin/printers/ED1/command", { action: "start", confirmPrinter: "ED1" }, otherCookie)).status, 403);
  const User = require("../models/Users");
  await User.updateOne({ email: "test@example.test" }, { $set: { isAdmin: true } });
  const settings = await (await request("/public/site")).json();
  const updated = { ...settings, announcement: "Studio maintenance test", acceptingUploads: false, cameras: { ED1: false, ED2: false } };
  const update = body => request("/admin/site", { method: "PUT", headers: { Cookie: cookie, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  assert.equal((await update({ ...updated, arbitrary: "not permitted" })).status, 400);
  assert.equal((await update(updated)).status, 200);
  assert.equal((await (await request("/public/site")).json()).announcement, updated.announcement);
  assert.equal((await request("/public/cameras/ED1")).status, 503);
  const form = new FormData(); form.append("printer", "ED1"); form.append("file", new Blob(["test"]), "closed.gcode");
  assert.equal((await request("/models/upload", { method: "POST", headers: { Cookie: cookie }, body: form })).status, 503);
  assert.equal((await post("/admin/printers/ED1/command", { action: "start" }, cookie)).status, 400);
  assert.equal((await post("/admin/printers/ED1/command", { action: "arbitrary", confirmPrinter: "ED1" }, cookie)).status, 400);
  assert.equal((await update(settings)).status, 200);
});
test("verification codes expire and lock after five incorrect attempts", async () => {
  const email = "verification-test@example.test";
  assert.equal((await post("/auth/register", { username: "Verification Test", email, password, isAdmin: true, emailVerified: true })).status, 202);
  const User = require("../models/Users");
  const Verification = require("../models/EmailVerification");
  const Notification = require("../models/EmailNotification");
  const user = await User.findOne({ email });
  assert.equal(user.isAdmin, false); assert.equal(user.emailVerified, false);
  let message = await Notification.findOne({ to: email });
  const token = message.text.match(/#token=([a-f0-9]{64})/)[1], code = message.text.match(/Enter this code: (\d{6})/)[1];
  for (let i = 0; i < 5; i++) assert.equal((await post("/auth/verify-email", { token, code: "000000" })).status, 400);
  assert.equal((await post("/auth/verify-email", { token, code })).status, 400);
  await Verification.updateOne({ userId: user._id }, { $set: { attempts: 0, expiresAt: new Date(Date.now() - 1000) } });
  assert.equal((await post("/auth/verify-email", { token, code })).status, 400);
});

test('camera relay uses a fixed upstream, forwards MJPEG, and stops when broadcasting is disabled', async () => {
  const http = require('node:http');
  const { closeCamera } = require('../services/cameras');
  let requests = 0;
  const source = http.createServer((req, res) => {
    requests++; assert.equal(req.headers['x-api-key'], undefined);
    assert.equal(req.url, '/stream');
    res.writeHead(200, { 'Content-Type': 'multipart/x-mixed-replace; boundary=frame' });
    res.write('--frame\r\nContent-Type: image/jpeg\r\nContent-Length: 4\r\n\r\ntest\r\n');
  });
  await new Promise(resolve => source.listen(0, '127.0.0.1', resolve));
  const saved = process.env.OCTOPRINT_ED1_CAMERA_URL;
  process.env.OCTOPRINT_ED1_CAMERA_URL = `http://127.0.0.1:${source.address().port}/stream`;
  try {
    const response = await request('/public/cameras/ED1?url=http://untrusted.example');
    assert.equal(response.status, 200); assert.match(response.headers.get('content-type'), /multipart/);
    const reader = response.body.getReader();
    const first = await reader.read(); assert.match(new TextDecoder().decode(first.value), /--frame/);
    closeCamera('ED1');
    await reader.cancel().catch(() => {});
    assert.equal(requests, 1);
  } finally { process.env.OCTOPRINT_ED1_CAMERA_URL = saved; source.closeAllConnections(); await new Promise(resolve => source.close(resolve)); }
});

test('full OctoPrint HTTP proxy requires admin access and preserves native requests', async () => {
  const http = require('node:http');
  const received = [];
  const source = http.createServer(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    received.push({ url: req.url, method: req.method, cookie: req.headers.cookie, key: req.headers['x-api-key'], body: Buffer.concat(chunks).toString() });
    res.setHeader('Set-Cookie', 'octoprint_session=fixture; Path=/ED1/; HttpOnly');
    res.end('<html>Native OctoPrint fixture</html>');
  });
  await new Promise(resolve => source.listen(0, '127.0.0.1', resolve));
  const saved = process.env.OCTOPRINT_ED1_URL;
  process.env.OCTOPRINT_ED1_URL = `http://127.0.0.1:${source.address().port}/ED1`;
  const url = base.slice(0, -4) + '/ED1/';
  try {
    assert.equal((await fetch(url)).status, 401);
    assert.equal((await fetch(url, { headers: { Cookie: otherCookie } })).status, 403);
    assert.equal(received.length, 0);
    const response = await fetch(url, { headers: { Cookie: cookie + '; octoprint_session=fixture' } });
    assert.equal(response.status, 200); assert.match(await response.text(), /Native OctoPrint/);
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.match(response.headers.get('set-cookie'), /Path=\/ED1\//);
    assert.equal(received[0].cookie, 'octoprint_session=fixture'); assert.equal(received[0].key, undefined);
    const body = '{"user":"test","pass":"mock-only"}';
    assert.equal((await fetch(url + 'api/login', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body })).status, 200);
    assert.equal(received[1].body, body); assert.equal(received[1].url, '/ED1/api/login');
    assert.equal((await fetch(url + 'static/test.js', { headers: { Cookie: otherCookie } })).status, 403);
    const bootstrap = await post('/admin/octoprint/session', {}, cookie);
    assert.equal(bootstrap.status, 200); assert.ok(bootstrap.headers.getSetCookie().some(value => /Path=\/;/.test(value) && !value.includes('Expires=Thu, 01 Jan 1970')));
  } finally { process.env.OCTOPRINT_ED1_URL = saved; source.closeAllConnections(); await new Promise(resolve => source.close(resolve)); }
});

test('OctoPrint websocket upgrades reject guests and members and relay admin connections', async () => {
  const http = require('node:http'); const { createHash } = require('node:crypto');
  const source = http.createServer(); let upgrades = 0; let remoteSocket;
  source.on('upgrade', (req, socket) => {
    upgrades++; remoteSocket = socket;
    assert.doesNotMatch(req.headers.cookie || '', /ironroot_session/);
    const accept = createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  });
  await new Promise(resolve => source.listen(0, '127.0.0.1', resolve));
  const saved = process.env.OCTOPRINT_ED1_URL;
  process.env.OCTOPRINT_ED1_URL = `http://127.0.0.1:${source.address().port}/ED1`;
  function connect(session, origin = 'http://127.0.0.1:3002') { return new Promise((resolve, reject) => {
    const request = http.request(base.slice(0, -4) + '/ED1/sockjs/websocket', { headers: { Connection: 'Upgrade', Upgrade: 'websocket', Origin: origin, 'Sec-WebSocket-Version': '13', 'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==', ...(session ? { Cookie: session } : {}) } });
    request.on('response', response => { response.resume(); resolve(response.statusCode); });
    request.on('upgrade', (response, socket) => { socket.destroy(); resolve(response.statusCode); });
    request.on('error', reject); request.setTimeout(5000, () => request.destroy(Error('Upgrade timed out'))); request.end();
  }); }
  try {
    assert.equal(await connect(), 401); assert.equal(await connect(otherCookie), 401);
    assert.equal(await connect(cookie, 'http://foreign.example'), 403); assert.equal(upgrades, 0);
    assert.equal(await connect(cookie), 101); assert.equal(upgrades, 1);
  } finally { process.env.OCTOPRINT_ED1_URL = saved; remoteSocket?.destroy(); source.closeAllConnections(); await new Promise(resolve => source.close(resolve)); }
});
test('real OctoPrint login screens load through the isolated admin proxy', async () => {
  for (const id of ['ED1', 'ED2']) {
    const response = await fetch(base.slice(0, -4) + `/${id}/`, { headers: { Cookie: cookie } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
    const html = await response.text();
    assert.match(html, /password/i); assert.match(html, new RegExp(`/${id}/static/`));
    assert.ok(!html.includes(process.env[`OCTOPRINT_${id}_API_KEY`]));
  }
});

test('portfolio drafts remain private, publication persists, and existing projects can be unpublished', async () => {
  const Project = require('../models/PortfolioProject');
  const original = (await (await request('/public/projects')).json()).projects;
  assert.equal(original.length, 5);
  const values = { title: 'New tech completion', category: 'Web & software', description: 'A completed website project.', body: 'The work and outcome.', date: '2026-09-08', stage: 'Completed', status: 'draft', image: '/printing/IMG_7639.jpg', alt: 'Workshop photo', externalUrl: 'https://resume-site-eight-snowy.vercel.app/' };
  assert.equal((await post('/admin/projects', values, otherCookie)).status, 403);
  const response = await post('/admin/projects', values, cookie); assert.equal(response.status, 201);
  const { project } = await response.json();
  assert.equal((await request('/public/projects/' + project.id)).status, 404);
  const put = (id, body) => request('/admin/projects/' + id, { method: 'PUT', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal((await put(project.id, { ...values, externalUrl: 'javascript:alert(1)' })).status, 400);
  assert.equal((await put(project.id, { ...values, image: '/../../private' })).status, 400);
  assert.equal((await put(project.id, { ...values, status: 'published' })).status, 200);
  const published = await (await request('/public/projects/' + project.id)).json(); assert.equal(published.project.title, values.title);
  assert.equal((await Project.findById(project.id)).status, 'published');
  const existing = original[0]; const fields = Object.keys(values); const edit = Object.fromEntries(fields.map(field => [field, existing[field]]));
  assert.equal((await put(existing.id, { ...edit, status: 'draft' })).status, 200);
  assert.equal((await request('/public/projects/' + existing.id)).status, 404);
  await Project.deleteOne({ _id: existing.id });
});
test('portfolio photos validate bytes and remain private until their project is published', async () => {
  const portfolio = require('../services/portfolio'); const Project = require('../models/PortfolioProject');
  const upload = (content, filename, session = cookie) => { const form = new FormData(); form.append('image', new Blob([content]), filename); return request('/admin/projects/images', { method: 'POST', headers: { Cookie: session }, body: form }); };
  assert.equal((await upload('<script>bad</script>', 'photo.jpg')).status, 400);
  assert.equal((await upload('no', 'photo.jpg', otherCookie)).status, 403);
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=', 'base64');
  const response = await upload(bytes, 'photo.png'); assert.equal(response.status, 201);
  const { image } = await response.json();
  try {
    assert.equal((await fetch(base.slice(0,-4) + image)).status, 404);
    const preview = await fetch(base.slice(0,-4) + image.replace('/public/', '/admin/projects/').replace('/project-images/', '/images/'), { headers: { Cookie: cookie } });
    assert.equal(preview.status, 200);
    const values = { title: 'Photo publication', category: '3D printing', description: 'Finished print photo.', body: '', date: '2026-09-08', stage: 'Completed', status: 'published', image, alt: 'A project photo', externalUrl: '' };
    const created = await (await post('/admin/projects', values, cookie)).json();
    const publicImage = await fetch(base.slice(0,-4) + image); assert.equal(publicImage.status, 200); assert.match(publicImage.headers.get('content-type'), /image\/png/);
    assert.deepEqual(Buffer.from(await publicImage.arrayBuffer()), bytes);
    await Project.deleteOne({ _id: created.project.id });
  } finally { await fs.unlink(path.join(portfolio.imageDirectory, image.split('/').pop())); }
});
