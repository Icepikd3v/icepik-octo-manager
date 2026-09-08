const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const { getSettings, validateSettings } = require('../services/siteSettings');
const Settings = require('../models/SiteSettings');
const Audit = require('../models/AdminAudit');
const { closeCamera } = require('../services/cameras');
const control = require('../services/printerControl');
const { getPrinterStatus } = require('../services/printerStatus');
const busy = new Set();
router.use(auth, admin);
router.post("/octoprint/session", (req, res) => require("../controllers/authController").signIn(res, req.account));
router.get('/overview', async (req, res) => res.json({ settings: await getSettings(), printers: await Promise.all(['ED1', 'ED2'].map(getPrinterStatus)), audit: await Audit.find().sort({ createdAt: -1 }).limit(20).select('printer action result createdAt').lean() }));
router.put('/site', async (req, res) => {
  let settings;
  try { settings = validateSettings(req.body); } catch (e) { return res.status(400).json({ message: e.message }); }
  const audit = await Audit.create({ userId: req.user.id, action: 'site.update' });
  await Settings.findByIdAndUpdate('public', { $set: settings }, { upsert: true, runValidators: true });
  for (const id of ['ED1', 'ED2']) if (!settings.cameras[id]) closeCamera(id);
  audit.result = 'accepted'; await audit.save();
  res.json({ settings: await getSettings() });
});
router.get('/printers/:id/files', async (req, res) => {
  try { res.json({ files: await control.listFiles(req.params.id) }); }
  catch (e) { res.status(e.status || 503).json({ message: 'Could not load printer files.' }); }
});
router.post('/printers/:id/command', async (req, res) => {
  const id = req.params.id;
  if (!['ED1', 'ED2'].includes(id)) return res.sendStatus(404);
  if (!['select', 'start', 'pause', 'resume', 'cancel'].includes(req.body?.action) || req.body.confirmPrinter !== id) return res.status(400).json({ message: 'Confirm a supported action for this printer.' });
  if (busy.has(id)) return res.status(409).json({ message: 'A command is already in progress.' });
  busy.add(id); let audit;
  try {
    audit = await Audit.create({ userId: req.user.id, printer: id, action: req.body.action });
    await control.command(id, req.body);
    audit.result = 'accepted'; await audit.save();
    res.json({ message: `${id}: ${req.body.action} accepted. Refresh status to confirm the result.` });
  } catch (e) {
    if (audit) { audit.result = 'failed'; await audit.save().catch(() => {}); }
    res.status(e.status || (e.response?.status === 409 ? 409 : 503)).json({ message: e.status ? e.message : 'Printer did not confirm the command. Refresh its status before trying again.' });
  } finally { busy.delete(id); }
});
module.exports = router;
