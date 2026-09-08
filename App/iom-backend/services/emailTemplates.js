const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const copy = {
  uploaded: ["Your file is saved for review", "We received your project file. It is saved for review; a print has not started. We’ll discuss preparation and next steps with you."],
  queued: ["Your print is queued", "Your project has been added to the print queue."],
  printing: ["Your print has started", "Printing has started for your project."],
  paused: ["Your print is paused", "Printing is paused. We’ll update you as the project progresses."],
  completed: ["Your print is complete", "The print has finished. We’ll confirm any finishing and collection or delivery arrangements separately."],
  canceled: ["Your print was canceled", "This print has been canceled. Reply if you’d like to discuss the next step."],
  failed: ["Your print needs attention", "The print encountered a problem. We’ll review what happened and discuss the next step with you."],
  shipped: ["Your print has shipped", "Your project has been marked as shipped."],
};
function safeTrackingUrl(value) {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
function printUpdate(status, { username, filename, printer, trackingUrl } = {}) {
  if (!Object.hasOwn(copy, status)) throw new Error("Unsupported print notification status.");
  const [title, description] = copy[status];
  const tracking = status === "shipped" ? safeTrackingUrl(trackingUrl) : null;
  const name = username || "there";
  const displayedPrinter = ({ EnderDirect: "ED1", EnderMultiColor: "ED2" })[printer] || printer;
  const text = `Hi ${name},\n\n${title}\n\nFile: ${filename || "Your project"}${displayedPrinter ? `\nPrinter: ${displayedPrinter}` : ""}\n\n${description}${tracking ? `\n\nTracking: ${tracking}` : ""}\n\nQuestions? Reply to this email.\nIronRoot Solutions`;
  return {
    subject: `IronRoot Solutions — ${title}`,
    text,
    html: `<div style="background:#0b111c;padding:28px;font-family:Arial,sans-serif;color:#edf3fc;max-width:600px;margin:auto;border-top:4px solid #88baff"><p style="color:#a8d5ff;letter-spacing:2px;font-size:12px">IRONROOT SOLUTIONS / PRINT STUDIO</p><h1 style="font-size:24px;color:#edf3fc">${escapeHtml(title)}</h1><p>Hi ${escapeHtml(name)},</p><p style="line-height:1.7;color:#c4d3e7">${escapeHtml(description)}</p><div style="background:#172338;padding:18px"><strong>${escapeHtml(filename || "Your project")}</strong>${displayedPrinter ? `<p>Printer: ${escapeHtml(displayedPrinter)}</p>` : ""}</div>${tracking ? `<p><a style="color:#a8d5ff" href="${escapeHtml(tracking)}">Track your shipment</a></p>` : ""}<p style="line-height:1.7;color:#c4d3e7">Questions? Reply to this email and we’ll help.</p><p style="font-size:12px;color:#a5b4c9">IronRoot Solutions · Technology, made practical.</p></div>`,
  };
}
module.exports = {
  printUpdate, safeTrackingUrl,
  queued: data => printUpdate("queued", data),
  started: data => printUpdate("printing", data),
  completed: data => printUpdate("completed", data),
  canceled: data => printUpdate("canceled", data),
  shipped: data => printUpdate("shipped", data),
};
