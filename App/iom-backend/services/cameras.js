const axios = require('axios');
const connections = { ED1: new Set(), ED2: new Set() };
const epochs = { ED1: 0, ED2: 0 };
const cameraEpoch = id => epochs[id];
function cameraUrl(id) {
  if (!Object.hasOwn(connections, id)) return null;
  const raw = process.env[`OCTOPRINT_${id}_CAMERA_URL`];
  if (!raw) return null;
  try { const url = new URL(raw); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.hash ? url.href : null; } catch { return null; }
}
function closeCamera(id) { epochs[id]++; for (const close of connections[id] || []) close(); }
async function streamCamera(id, req, res, expectedEpoch = cameraEpoch(id)) {
  if (expectedEpoch !== cameraEpoch(id)) return res.status(503).json({ message: "Broadcast settings changed. Reconnect to check availability." });
  const url = cameraUrl(id);
  if (!url) return res.status(503).json({ message: 'Camera is not connected yet.' });
  if (connections[id].size >= 12) return res.status(503).json({ message: 'Camera is busy. Please try again shortly.' });
  const controller = new AbortController();
  const close = () => { controller.abort(); connections[id].delete(close); if (!res.writableEnded) res.destroy(); };
  connections[id].add(close);
  res.on('close', close);
  try {
    // Only server-configured camera destinations, never user-supplied URLs or API keys.
    const upstream = await axios.get(url, { responseType: 'stream', signal: controller.signal, timeout: 10000, maxRedirects: 0 });
    const type = upstream.headers['content-type'] || '';
    if (!/^multipart\/x-mixed-replace\s*;.*boundary=/i.test(type)) { upstream.data.destroy(); throw Error('Camera is not an MJPEG stream.'); }
    res.setHeader('Content-Type', type); res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Accel-Buffering', 'no'); res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    upstream.data.on('error', close); upstream.data.pipe(res);
  } catch {
    connections[id].delete(close);
    if (!res.headersSent && !res.destroyed) res.status(503).json({ message: 'Camera is offline. It will return when the studio camera is available.' });
    else close();
  }
}
module.exports = { cameraEpoch, cameraUrl, closeCamera, streamCamera };
