const { randomBytes, randomInt, createHash } = require('node:crypto');
const Verification = require('../models/EmailVerification');
const Notification = require('../models/EmailNotification');
const User = require('../models/Users');
const hash = value => createHash('sha256').update(value).digest('hex');
function siteUrl() {
  const url = new URL(process.env.PUBLIC_SITE_URL || 'http://127.0.0.1:3002');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw Error('Set PUBLIC_SITE_URL.');
  return url.origin;
}
async function requestVerification(user) {
  const existing = await Verification.findOne({ userId: user._id });
  if (existing && Date.now() - existing.lastRequestedAt.getTime() < 60000) return;
  const token = randomBytes(32).toString('hex'), code = String(randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + 30 * 60000);
  const link = `${siteUrl()}/verify-email#token=${token}`;
  await Verification.findOneAndUpdate({ userId: user._id }, { $set: { tokenHash: hash(token), codeHash: hash(token + ':' + code), expiresAt, attempts: 0, lastRequestedAt: new Date() } }, { upsert: true, runValidators: true });
  await Notification.updateMany({ to: user.email, eventKey: /^verification:/, status: "pending" }, { $set: { status: "failed", lastError: "SUPERSEDED" } });
  await Notification.create({ eventKey: `verification:${user._id}:${hash(token)}`, to: user.email, expiresAt,
    subject: 'Verify your IronRoot Solutions account',
    text: `Open this link to verify your Print Studio account:\n${link}\n\nEnter this code: ${code}\n\nThe link and code expire in 30 minutes. If you did not request an account, ignore this email.\nIronRoot Solutions`,
    html: `<div style="font-family:Arial,sans-serif;padding:28px;background:#0b111c;color:#edf3fc"><h1>Verify your Print Studio account</h1><p><a style="color:#a8d5ff" href="${link}">Open account verification</a>, then enter this code:</p><p style="font-size:30px;letter-spacing:6px">${code}</p><p>The link and code expire in 30 minutes. If you did not request an account, ignore this email.</p><p>IronRoot Solutions</p></div>` });
}
async function verifyCode(token, code) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) || typeof code !== 'string' || !/^\d{6}$/.test(code)) return null;
  const challenge = await Verification.findOneAndUpdate({ tokenHash: hash(token), expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } }, { $inc: { attempts: 1 } }, { new: true });
  if (!challenge || challenge.codeHash !== hash(token + ':' + code)) return null;
  // Consume atomically, so a successful code can only create one session.
  const consumed = await Verification.findOneAndDelete({ _id: challenge._id, tokenHash: hash(token) });
  if (!consumed) return null;
  return User.findByIdAndUpdate(challenge.userId, { $set: { emailVerified: true } }, { new: true });
}
module.exports = { requestVerification, verifyCode };
