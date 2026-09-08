const Settings = require('../models/SiteSettings');
const fields = ['announcement', 'homeIntro', 'liveIntro', 'acceptingUploads', 'cameras'];
async function getSettings() {
  const doc = await Settings.findById('public').lean() || new Settings().toObject();
  return Object.fromEntries(fields.map(key => [key, doc[key]]));
}
function validateSettings(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !fields.includes(key))) throw Error('Invalid site settings.');
  const result = {};
  for (const [key, max] of [['announcement', 240], ['homeIntro', 600], ['liveIntro', 600]]) {
    if (typeof body[key] !== 'string' || body[key].length > max) throw Error(`${key} must be text of at most ${max} characters.`);
    result[key] = body[key].trim();
  }
  if (typeof body.acceptingUploads !== 'boolean' || typeof body.cameras?.ED1 !== 'boolean' || typeof body.cameras?.ED2 !== 'boolean') throw Error('Invalid visibility or upload setting.');
  return { ...result, acceptingUploads: body.acceptingUploads, cameras: { ED1: body.cameras.ED1, ED2: body.cameras.ED2 } };
}
module.exports = { getSettings, validateSettings };
