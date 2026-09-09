const router = require('express').Router();
const { getSettings } = require('../services/siteSettings');
const { getPrinterStatus } = require('../services/printerStatus');
const { cameraEpoch, cameraUrl, streamCamera } = require('../services/cameras');
let cached, expires = 0, pending;
function safePrinter(p) {
  const states = ["Operational", "Printing", "Paused", "Pausing", "Resuming", "Cancelling", "Finishing", "Closed", "Offline", "Connecting", "Detecting serial connection", "Error"];
  return { id: p.id, name: p.id, reachable: p.reachable, connected: p.connected, state: p.reachable && states.includes(p.state) ? p.state : 'Unavailable', updatedAt: p.updatedAt, partial: p.partial,
    nozzle: p.nozzle, bed: p.bed, job: p.job ? { ...(p.connected && p.state === "Printing" && p.job.filename ? { filename: p.job.filename.split(/[\\/]/).pop() } : {}), completion: p.job.completion, secondsLeft: p.job.secondsLeft } : null };
}
async function statuses() {
  if (cached && Date.now() < expires) return cached;
  if (!pending) pending = Promise.all(['ED1', 'ED2'].map(getPrinterStatus)).then(result => { cached = result.map(safePrinter); expires = Date.now() + 10000; return cached; }).finally(() => { pending = null; });
  return pending;
}
router.get('/projects', async (req, res) => res.json({ projects: await require('../services/portfolio').listProjects() }));
router.get('/projects/:id', async (req, res) => {
  const project = (await require('../services/portfolio').listProjects()).find(project => project.id === req.params.id);
  return project ? res.json({ project }) : res.status(404).json({ message: 'Project not found.' });
});
router.get('/project-images/:filename', async (req, res) => {
  const { imageName, imageDirectory } = require('../services/portfolio');
  if (!imageName.test(req.params.filename)) return res.sendStatus(404);
  if (!(await require('../services/portfolio').listProjects()).some(project => project.image === `/api/public/project-images/${req.params.filename}`)) return res.sendStatus(404);
  res.sendFile(require('node:path').join(imageDirectory, req.params.filename), error => { if (error && !res.headersSent) res.sendStatus(404); });
});
router.get('/site', async (req, res) => res.json(await getSettings()));
router.get('/printers', async (req, res) => {
  const settings = await getSettings();
  res.json({ printers: (await statuses()).map(p => ({ ...p, camera: { enabled: settings.cameras[p.id], configured: Boolean(cameraUrl(p.id)), stream: settings.cameras[p.id] && cameraUrl(p.id) ? `/api/public/cameras/${p.id}` : null } })) });
});
router.get('/cameras/:id', async (req, res) => {
  if (!['ED1', 'ED2'].includes(req.params.id)) return res.sendStatus(404);
  const epoch = cameraEpoch(req.params.id);
  const settings = await getSettings();
  if (!settings.cameras[req.params.id]) return res.status(503).json({ message: 'Camera is not broadcasting.' });
  return streamCamera(req.params.id, req, res, epoch);
});
module.exports = { router, safePrinter };
