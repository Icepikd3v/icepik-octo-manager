const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createEmailService } = require('../services/emailService');
const { printUpdate, safeTrackingUrl } = require('../services/emailTemplates');
const env = { SMTP_USER: 'sender@example.test', SMTP_PASS: 'test pass', EMAIL_ENABLED: 'true' };
test('verification authenticates without sending and delivery uses the company sender', async () => {
  let options, message, verifications = 0;
  const service = createEmailService({ env, createTransport: config => {
    options = config;
    return { verify: async () => { verifications++; }, sendMail: async data => { message = data; return { accepted: ['customer@example.test'], rejected: [], messageId: 'test-id' }; } };
  } });
  await service.verify();
  assert.equal(verifications, 1); assert.equal(message, undefined);
  assert.equal(options.host, 'smtp.gmail.com'); assert.equal(options.secure, true);
  assert.equal(options.auth.pass, 'testpass');
  await service.send({ to: 'customer@example.test', ...printUpdate('uploaded', { filename: 'part.stl' }) });
  assert.deepEqual(message.from, { name: 'IronRoot Solutions', address: env.SMTP_USER });
  assert.equal(message.replyTo, env.SMTP_USER);
  assert.equal(message.disableFileAccess, true); assert.equal(message.disableUrlAccess, true);
});
test('disabled sending never contacts SMTP and transport failures propagate', async () => {
  const disabled = createEmailService({ env: { ...env, EMAIL_ENABLED: 'false' }, createTransport: () => { throw Error('should not connect'); } });
  await assert.rejects(disabled.send({}), /disabled/);
  const rejected = createEmailService({ env, createTransport: () => ({ sendMail: async () => ({ accepted: [], rejected: ['customer@example.test'] }) }) });
  await assert.rejects(rejected.send({}), /did not accept/);
  const unavailable = createEmailService({ env, createTransport: () => ({ sendMail: async () => { throw Error('offline'); } }) });
  await assert.rejects(unavailable.send({}), /offline/);
});
test('customer content is escaped and upload receipts do not claim printing started', () => {
  const receipt = printUpdate('uploaded', { username: '<script>alert(1)</script>', filename: '<img src=x onerror=alert(1)>', printer: 'EnderDirect' });
  assert.doesNotMatch(receipt.html, /<script|<img/);
  assert.match(receipt.html, /&lt;script&gt;/); assert.match(receipt.text, /a print has not started/);
  assert.match(receipt.text, /Printer: ED1/);
  assert.doesNotMatch(printUpdate('completed').text, /has shipped|tracking/i);
  assert.throws(() => printUpdate('unknown'), /Unsupported/);
});
test('tracking links only appear for shipped jobs with safe HTTPS destinations', () => {
  for (const url of ['javascript:alert(1)', 'http://example.test', 'https://user:pass@example.test', 'not-a-url']) assert.equal(safeTrackingUrl(url), null);
  assert.doesNotMatch(printUpdate('shipped', { trackingUrl: 'javascript:alert(1)' }).html, /href=/);
  assert.doesNotMatch(printUpdate('queued', { trackingUrl: 'https://example.test/track' }).html, /href=/);
  assert.match(printUpdate('shipped', { trackingUrl: 'https://example.test/track?a=1&b=2' }).html, /a=1&amp;b=2/);
});
