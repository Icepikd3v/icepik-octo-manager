const axios = require('axios');
const { getOctoPrintConfig } = require('../config/octoprint');
const ids = ['ED1', 'ED2'];
function client(id) {
  if (!ids.includes(id)) throw Object.assign(Error('Unknown printer.'), { status: 404 });
  const { baseUrl, apiKey } = getOctoPrintConfig(id);
  return axios.create({ baseURL: `${baseUrl}/api/`, headers: { 'X-Api-Key': apiKey }, timeout: 10000, maxRedirects: 0 });
}
function validPath(path) {
  return typeof path === 'string' && path.length <= 500 && !path.startsWith('/') && !/[\\\x00-\x1f]/.test(path) && path.split('/').every(part => part && part !== '.' && part !== '..') && /\.gco(de)?$/i.test(path);
}
async function listFiles(id) {
  const { data } = await client(id).get('files/local?recursive=true');
  const files = [];
  function visit(entries) { for (const file of entries || []) {
    if (file.type === 'folder') visit(file.children);
    else if (validPath(file.path)) files.push({ path: file.path, name: file.display || file.name, size: file.size });
  } }
  visit(data.files); return files.slice(0, 500);
}
async function command(id, body) {
  const api = client(id);
  if (body.action === 'select') {
    if (!validPath(body.path)) throw Object.assign(Error('Select a valid G-code file.'), { status: 400 });
    const files = await listFiles(id);
    if (!files.some(file => file.path === body.path)) throw Object.assign(Error('File is no longer available.'), { status: 409 });
    await api.post(`files/local/${body.path.split('/').map(encodeURIComponent).join('/')}`, { command: 'select', print: false });
    return;
  }
  const actions = { start: { command: 'start' }, pause: { command: 'pause', action: 'pause' }, resume: { command: 'pause', action: 'resume' }, cancel: { command: 'cancel' } };
  if (!Object.hasOwn(actions, body.action)) throw Object.assign(Error('Unsupported printer action.'), { status: 400 });
  const { data } = await api.get('job');
  const current = data.job?.file?.path || data.job?.file?.name;
  if (!current || typeof body.expectedFile !== 'string' || current !== body.expectedFile) throw Object.assign(Error('The selected job changed. Refresh before confirming.'), { status: 409 });
  const states = { start: ['Operational'], pause: ['Printing'], resume: ['Paused'], cancel: ['Printing', 'Paused'] };
  if (!states[body.action].includes(data.state)) throw Object.assign(Error('This action is not available in the current printer state.'), { status: 409 });
  await api.post('job', actions[body.action]);
}
module.exports = { command, listFiles, validPath };
