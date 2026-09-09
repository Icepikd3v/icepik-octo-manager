const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const Project = require('../models/PortfolioProject');
const defaults = require('../config/projectDefaults.json');
const imageDirectory = path.join(__dirname, '../content-images');
const imageName = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;
const fields = ['title', 'category', 'description', 'body', 'date', 'stage', 'status', 'image', 'alt', 'externalUrl'];
function validateProject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !fields.includes(key))) throw Error('Invalid project fields.');
  const result = {};
  for (const [field, max] of [['title', 120], ['description', 500], ['body', 8000], ['date', 10], ['image', 400], ['alt', 250], ['externalUrl', 500]]) {
    if (typeof value[field] !== 'string' || value[field].length > max) throw Error(`${field} must be text up to ${max} characters.`);
    result[field] = value[field].trim();
  }
  if (!result.title || !result.description || !result.alt) throw Error('Title, summary, and image description are required.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result.date) || !Number.isFinite(Date.parse(result.date)) || new Date(result.date).toISOString().slice(0, 10) !== result.date) throw Error('Choose a valid project date.');
  if (!['3D printing', 'Electronics', 'Installations', 'Web & software'].includes(value.category) || !['In progress', 'Completed'].includes(value.stage) || !['draft', 'published'].includes(value.status)) throw Error('Invalid project category, stage, or publication status.');
  const known = defaults.some(p => p.image === result.image);
  if (!known && !/^\/printing\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/.test(result.image) && !(result.image.startsWith('/api/public/project-images/') && imageName.test(result.image.slice('/api/public/project-images/'.length)))) throw Error('Choose an existing studio image or upload a JPG, PNG, or WebP photo.');
  if (result.externalUrl) { let url; try { url = new URL(result.externalUrl); } catch { throw Error('Use a full HTTPS project link.'); } if (url.protocol !== 'https:' || url.username || url.password) throw Error('Use a full HTTPS project link.'); result.externalUrl = url.href; }
  return { ...result, category: value.category, stage: value.stage, status: value.status };
}
async function listProjects(publicOnly = true) {
  const stored = await Project.find().sort({ createdAt: -1 }).lean();
  const merged = new Map(defaults.map(project => [project.id, { ...project, legacy: true }]));
  for (const project of stored) { const original = merged.get(project._id); merged.set(project._id, { ...original, ...Object.fromEntries(fields.map(field => [field, project[field]])), id: project._id, position: original?.position || 'gallery', legacy: Boolean(original), updatedAt: project.updatedAt }); }
  return [...merged.values()].filter(project => !publicOnly || project.status === 'published').sort((a, b) => b.date.localeCompare(a.date));
}
async function saveProject(id, body) {
  const value = validateProject(body);
  if (id && !(await listProjects(false)).some(project => project.id === id)) throw Object.assign(Error('Project not found.'), { status: 404 });
  const projectId = id || `${value.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 65) || 'project'}-${randomUUID().slice(0, 8)}`;
  await Project.findByIdAndUpdate(projectId, { $set: value }, { upsert: true, runValidators: true });
  return (await listProjects(false)).find(project => project.id === projectId);
}
async function saveImage(buffer) {
  let ext;
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) ext = 'jpg';
  else if (buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ext = 'png';
  else if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') ext = 'webp';
  else throw Error('Upload a JPG, PNG, or WebP photo.');
  await fs.mkdir(imageDirectory, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(imageDirectory, filename), buffer, { flag: 'wx' });
  return `/api/public/project-images/${filename}`;
}
module.exports = { listProjects, saveProject, validateProject, saveImage, imageDirectory, imageName };
