const http = require('node:http');
const https = require('node:https');
const { pipeline } = require('node:stream');
const auth = require('../middleware/authMiddleware');
const { getOctoPrintConfig } = require('../config/octoprint');
const hop = new Set(['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade']);
function destination(raw) {
  // Keep OctoPrint's existing /ED1 and /ED2 prefixes intact for plugin compatibility.
  const match = /^\/(ED1|ED2)(?=\/|\?|$)/.exec(raw);
  if (!match) return null;
  const { baseUrl } = getOctoPrintConfig(match[1]);
  const base = new URL(baseUrl);
  return { id: match[1], base, path: base.pathname.replace(/\/$/, '') + raw.slice(match[0].length) };
}
function headers(req, target, websocket = false) {
  const result = {};
  for (const [key, value] of Object.entries(req.headers)) if (!hop.has(key) && !['host', 'authorization', 'cookie'].includes(key) && !key.startsWith('x-forwarded-') && !['x-script-name', 'x-scheme', 'remote-user'].includes(key)) result[key] = value;
  const cookies = (req.headers.cookie || '').split(';').map(v => v.trim()).filter(v => v && !v.startsWith('ironroot_session='));
  if (cookies.length) result.cookie = cookies.join('; ');
  result.host = target.base.host;
  // Native OctoPrint CSRF/origin checks see the configured upstream origin.
  if (req.headers.origin) result.origin = target.base.origin;
  if (req.headers.referer) result.referer = target.base.origin + target.base.pathname + '/';
  if (websocket) { result.connection = 'Upgrade'; result.upgrade = 'websocket'; }
  return result;
}
function responseHeaders(upstream, target) {
  const result = {};
  for (const [key, value] of Object.entries(upstream.headers)) if (!hop.has(key)) result[key] = value;
  if (result.location?.startsWith(target.base.origin + '/')) result.location = result.location.slice(target.base.origin.length);
  if (result['set-cookie']) result['set-cookie'] = result['set-cookie'].map(cookie => cookie.replace(/;\s*Domain=[^;]+/ig, ''));
  // Permit only same-origin framing; retain OctoPrint's own script/style policy.
  result['x-frame-options'] = 'SAMEORIGIN';
  result['cache-control'] = 'no-store';
  return result;
}
function proxyWorkspace(req, res) {
  let target;
  try { target = destination(req.originalUrl || req.url); } catch { return res.status(503).send('OctoPrint is not configured.'); }
  if (!target) return res.sendStatus(404);
  const upstream = (target.base.protocol === 'https:' ? https : http).request({ hostname: target.base.hostname, port: target.base.port || undefined, protocol: target.base.protocol, path: target.path, method: req.method, headers: headers(req, target) }, response => {
    res.writeHead(response.statusCode, responseHeaders(response, target));
    pipeline(response, res, () => {});
  });
  upstream.setTimeout(130000, () => upstream.destroy());
  upstream.on('error', () => { if (!res.headersSent) res.status(503).send('OctoPrint is unavailable. Return to Admin and retry when the printer server is online.'); else res.destroy(); });
  res.on('close', () => upstream.destroy()); req.on('aborted', () => upstream.destroy());
  req.pipe(upstream);
}
function reject(socket, status) { socket.end(`HTTP/1.1 ${status} ${status === 401 ? 'Unauthorized' : 'Forbidden'}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`); }
async function authorizedUpgrade(req) {
  return new Promise(resolve => {
    const response = { status: () => response, json: () => resolve(false) };
    Promise.resolve(auth(req, response, () => resolve(req.account?.isAdmin === true))).catch(() => resolve(false));
  });
}
function attachWorkspaceUpgrade(server) {
  server.on('upgrade', async (req, socket, head) => {
    let target;
    try { target = destination(req.url); } catch { return reject(socket, 403); }
    if (!target || req.headers.upgrade?.toLowerCase() !== 'websocket') return reject(socket, 403);
    const allowed = (process.env.WEB_ORIGINS || 'http://127.0.0.1:3002,http://localhost:3002,http://127.0.0.1:3000,http://localhost:3000').split(',');
    if (!req.headers.origin || !allowed.includes(req.headers.origin)) return reject(socket, 403);
    if (!(await authorizedUpgrade(req))) return reject(socket, 401);
    if (socket.destroyed) return;
    const upstream = (target.base.protocol === 'https:' ? https : http).request({ hostname: target.base.hostname, port: target.base.port || undefined, protocol: target.base.protocol, path: target.path, method: 'GET', headers: headers(req, target, true) });
    upstream.on('upgrade', (response, remote, remoteHead) => {
      socket.write('HTTP/1.1 101 Switching Protocols\r\n' + Object.entries(response.headers).map(([key, value]) => `${key}: ${value}`).join('\r\n') + '\r\n\r\n');
      if (remoteHead.length) socket.write(remoteHead); if (head.length) remote.write(head);
      socket.pipe(remote); remote.pipe(socket);
      const close = () => { remote.destroy(); socket.destroy(); };
      socket.on('error', close); remote.on('error', close); socket.on('close', close); remote.on('close', close);
      // Recheck role/session periodically so an open socket is not indefinite access.
      const timer = setInterval(async () => { if (!(await authorizedUpgrade(req))) close(); }, 60000); timer.unref();
      socket.on('close', () => clearInterval(timer));
    });
    upstream.on('response', () => { upstream.destroy(); reject(socket, 403); });
    upstream.on('error', () => socket.destroy());
    socket.on('close', () => upstream.destroy());
    upstream.setTimeout(130000, () => upstream.destroy()); upstream.end();
  });
}
module.exports = { destination, headers, responseHeaders, proxyWorkspace, attachWorkspaceUpgrade };
