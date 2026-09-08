const Notification = require("../models/EmailNotification");
const ModelFile = require("../models/ModelFile");
const PrintJob = require("../models/PrintJob");
const User = require("../models/Users");
const { printUpdate } = require("./emailTemplates");
const { emailEnabled, sendNotification } = require("./emailService");

async function enqueue(eventKey, user, status, data) {
  const message = printUpdate(status, { username: user.username, ...data });
  try {
    await Notification.updateOne({ eventKey }, { $setOnInsert: { eventKey, to: user.email, ...message } }, { upsert: true });
  } catch (error) { if (error.code !== 11000) throw error; }
}
async function collectNotifications() {
  // The flag is written with the upload itself, so queue/database interruptions
  // cannot silently lose a receipt. Existing uploads are not backfilled.
  for (const file of await ModelFile.find({ receiptPending: true }).sort({ uploadDate: 1 }).limit(25)) {
    const user = await User.findById(file.userId);
    if (user) await enqueue(`upload:${file._id}`, user, "uploaded", { filename: file.name, printer: file.printer });
    await ModelFile.updateOne({ _id: file._id }, { $set: { receiptPending: false } });
  }
  // Only explicitly enrolled jobs generate lifecycle emails. The legacy
  // print-execution routes remain unmounted; do not infer owners from filenames.
  const jobs = await PrintJob.find({ notifyCustomer: true, $expr: { $ne: ["$status", { $ifNull: ["$lastNotifiedStatus", ""] }] } }).limit(25);
  for (const job of jobs) {
    const user = await User.findById(job.userId);
    if (user) await enqueue(`job:${job._id}:${job.status}`, user, job.status, { filename: job.filename, printer: job.printer, trackingUrl: job.trackingUrl });
    await PrintJob.updateOne({ _id: job._id, status: job.status }, { $set: { lastNotifiedStatus: job.status } });
  }
}
async function deliverNext(send = sendNotification, now = new Date()) {
  const notification = await Notification.findOneAndUpdate({
    status: { $in: ["pending", "sending"] }, availableAt: { $lte: now }, attempts: { $lt: 5 },
  }, { $set: { status: "sending", availableAt: new Date(now.getTime() + 5 * 60000) }, $inc: { attempts: 1 } }, { sort: { createdAt: 1 }, new: true });
  if (!notification) return false;
  try {
    const result = await send({ to: notification.to, subject: notification.subject, html: notification.html, text: notification.text, messageId: `<${notification._id}@ironroot-notifications.local>` });
    await Notification.updateOne({ _id: notification._id }, { $set: { status: "sent", sentAt: new Date(), messageId: result.messageId }, $unset: { lastError: 1 } });
  } catch (error) {
    const code = /^[A-Z0-9_]{1,40}$/.test(error.code || "") ? error.code : "DELIVERY_FAILED";
    await Notification.updateOne({ _id: notification._id }, { $set: {
      status: notification.attempts >= 5 ? "failed" : "pending",
      availableAt: new Date(now.getTime() + Math.min(3600000, 60000 * 2 ** notification.attempts)),
      lastError: code,
    } });
  }
  return true;
}
function startNotificationWorker() {
  let stopped = false, timer;
  async function tick() {
    try {
      if (emailEnabled()) {
        // A worker that died on its final attempt must not leave a permanent lease.
        await Notification.updateMany({ status: "sending", attempts: { $gte: 5 }, availableAt: { $lte: new Date() } }, { $set: { status: "failed", lastError: "WORKER_INTERRUPTED" } });
        await collectNotifications();
        for (let i = 0; i < 5 && !stopped; i++) if (!(await deliverNext())) break;
      }
    } catch { console.error("Email worker could not process updates; it will retry."); }
    finally { if (!stopped) { timer = setTimeout(tick, 15000); timer.unref(); } }
  }
  tick();
  return () => { stopped = true; clearTimeout(timer); };
}
module.exports = { enqueue, collectNotifications, deliverNext, startNotificationWorker };
