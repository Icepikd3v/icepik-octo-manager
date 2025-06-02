// services/emailTemplates.js

function queued({ username, filename }) {
  return {
    subject: `🎉 Your job is queued!`,
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:auto;">
        <h2>Hi ${username},</h2>
        <p>Your file <strong>${filename}</strong> is now in our print queue.</p>
        <p>We'll notify you when it starts printing. Stay tuned!</p>
      </div>
    `,
  };
}

function started({ username, filename, printer, webcamUrl }) {
  return {
    subject: `🚀 Your print has started!`,
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:auto;">
        <h2>Hello ${username},</h2>
        <p>Your file <strong>${filename}</strong> is now printing on <em>${printer}</em>.</p>
        ${
          webcamUrl
            ? `<p>🎥 <a href="${webcamUrl}">Watch it live here</a>.</p>`
            : `<p>Live feed not available.</p>`
        }
      </div>
    `,
  };
}

function completed({ username, filename }) {
  return {
    subject: `✅ Your print is complete!`,
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:auto;">
        <h2>Congrats ${username},</h2>
        <p>Your print <strong>${filename}</strong> is finished and ready for pickup or shipping.</p>
      </div>
    `,
  };
}

function canceled({ username, filename }) {
  return {
    subject: `⚠️ Your print was canceled`,
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:auto;">
        <h2>Hi ${username},</h2>
        <p>Your job <strong>${filename}</strong> was canceled.</p>
        <p>Feel free to re-queue it or contact support.</p>
      </div>
    `,
  };
}

function shipped({ username, filename, trackingUrl }) {
  return {
    subject: `📦 Your print has shipped!`,
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:auto;">
        <h2>Hello ${username},</h2>
        <p>Your print <strong>${filename}</strong> is on its way.</p>
        ${
          trackingUrl
            ? `<p>Track it here: <a href="${trackingUrl}">${trackingUrl}</a></p>`
            : `<p>Tracking info will be available soon.</p>`
        }
      </div>
    `,
  };
}

function progress({ username, filename, estimated_print_time }) {
  return {
    subject: `⏳ Print in Progress: ${filename}`,
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:auto;">
        <h2>Hey ${username},</h2>
        <p>Your print <strong>${filename}</strong> is progressing well.</p>
        <p>Estimated Time: ${(estimated_print_time / 60).toFixed(0)} minutes</p>
      </div>
    `,
  };
}

module.exports = {
  queued,
  started,
  completed,
  canceled,
  shipped,
  progress,
};
