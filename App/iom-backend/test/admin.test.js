const { test } = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const control = require('../services/printerControl');
const { safePrinter } = require('../routes/public');
const { validateSettings } = require('../services/siteSettings');
test('printer controls use explicit commands and reject stale job confirmations', async () => {
  process.env.OCTOPRINT_ED1_URL = 'http://mock-printer/ED1'; process.env.OCTOPRINT_ED1_API_KEY = 'mock-key';
  const original = axios.create; const sent = []; let state = 'Operational';
  axios.create = () => ({ get: async path => ({ data: path.startsWith('files') ? { files: [{ type: 'machinecode', path: 'part.gcode', name: 'part.gcode' }] } : { state, job: { file: { path: 'part.gcode' } } } }), post: async (...args) => sent.push(args) });
  try {
    await control.command('ED1', { action: 'select', path: 'part.gcode' });
    assert.deepEqual(sent.pop(), ['files/local/part.gcode', { command: 'select', print: false }]);
    await assert.rejects(control.command('ED1', { action: 'start', expectedFile: 'old.gcode' }), /changed/);
    await control.command('ED1', { action: 'start', expectedFile: 'part.gcode' });
    assert.deepEqual(sent.pop(), ['job', { command: 'start' }]);
    state = 'Printing'; await control.command('ED1', { action: 'pause', expectedFile: 'part.gcode' });
    assert.deepEqual(sent.pop(), ['job', { command: 'pause', action: 'pause' }]);
    state = 'Paused'; await control.command('ED1', { action: 'resume', expectedFile: 'part.gcode' });
    assert.deepEqual(sent.pop(), ['job', { command: 'pause', action: 'resume' }]);
    await control.command('ED1', { action: 'cancel', expectedFile: 'part.gcode' }); assert.deepEqual(sent.pop(), ['job', { command: 'cancel' }]);
    await assert.rejects(control.command('ED1', { action: 'start', expectedFile: 'part.gcode' }), /current printer state/);
    assert.equal(sent.length, 0);
  } finally { axios.create = original; }
});
test('public status strips filenames and site controls reject unsafe input', () => {
  const result = safePrinter({ id: 'ED1', state: 'Operational', reachable: true, job: { filename: 'private-project.gcode', path: 'private/path', completion: 20, secondsLeft: 100 }, apiKey: 'secret' });
  assert.doesNotMatch(JSON.stringify(result), /private|secret|filename/);
  for (const path of ['../part.gcode', '/part.gcode', 'folder/../part.gcode', 'part.stl', 'part\\file.gcode']) assert.equal(control.validPath(path), false);
  assert.equal(control.validPath('folder/part.gcode'), true);
  assert.throws(() => validateSettings({ announcement: { $gt: '' } }));
});

test('OctoPrint proxy has fixed destinations and never forwards the site session or bearer token', () => {
  const workspace = require('../services/octoprintWorkspace');
  const target = workspace.destination('/ED1/static/app.js?test=1');
  assert.equal(target.path, '/ED1/static/app.js?test=1');
  assert.equal(workspace.destination('/untrusted/'), null);
  const result = workspace.headers({ headers: { cookie: 'ironroot_session=private; octoprint_session=native', authorization: 'Bearer private', origin: 'http://website', 'x-forwarded-host': 'untrusted' } }, target);
  assert.equal(result.cookie, 'octoprint_session=native');
  assert.equal(result.authorization, undefined); assert.equal(result['x-forwarded-host'], undefined); assert.equal(result['x-api-key'], undefined);
});
