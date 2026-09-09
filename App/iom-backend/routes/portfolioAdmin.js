const router = require('express').Router();
const multer = require('multer');
const portfolio = require('../services/portfolio');
const Audit = require('../models/AdminAudit');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 } }).single('image');
router.get('/', async (req, res) => res.json({ projects: await portfolio.listProjects(false) }));
router.get('/images/:filename', (req, res) => {
  if (!portfolio.imageName.test(req.params.filename)) return res.sendStatus(404);
  res.sendFile(require('node:path').join(portfolio.imageDirectory, req.params.filename), error => { if (error && !res.headersSent) res.sendStatus(404); });
});
router.post('/images', (req, res) => upload(req, res, async error => {
  if (error) return res.status(400).json({ message: 'Choose one image up to 10 MB.' });
  if (!req.file) return res.status(400).json({ message: 'Choose a photo.' });
  try { res.status(201).json({ image: await portfolio.saveImage(req.file.buffer) }); }
  catch { res.status(400).json({ message: 'Upload a JPG, PNG, or WebP photo.' }); }
}));
async function save(req, res) {
  try {
    const project = await portfolio.saveProject(req.params.id, req.body);
    await Audit.create({ userId: req.user.id, action: `project.${project.status}`, result: 'accepted' });
    res.status(req.params.id ? 200 : 201).json({ project });
  } catch (error) { res.status(error.status || 400).json({ message: error.status || error.name === 'Error' ? error.message : 'Could not save this project.' }); }
}
router.post('/', save); router.put('/:id', save);
module.exports = router;
