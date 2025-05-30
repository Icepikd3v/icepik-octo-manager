// services/emailTemplates.js

/**
 * Clean, modern email templates for IOM print-job status updates.
 * Each function returns { subject, html }
 */

function queued({ username, filename }) {
  return {
    subject: `🎉 Your job is queued!`,
    html: `
      <div style="font-family: sans-serif; max-width:600px; margin:auto;">
        <h2 style="color:#4A90E2;">Hi ${username},</h2>
        <p>Thanks for choosing IOM Prints! Your file <strong>${filename}</strong> is now in our queue.</p>
        <p>📋 We’ll notify you when your print starts. Sit back and relax—creativity is on its way!</p>
        <footer style="margin-top:20px; font-size:12px; color:#888;">
          Icepik’s Octo Manager &bull; Innovating 3D printing experiences
        </footer>
      </div>
    `,
  };
}

function started({ username, filename, printer, webcamUrl }) {
  return {
    subject: `🚀 Your print has started`,
    html: `
      <div style="font-family: sans-serif; max-width:600px; margin:auto;">
        <h2 style="color:#50E3C2;">Hello ${username},</h2>
        <p>Great news! Your job <strong>${filename}</strong> is now printing on <em>${printer}</em>.</p>
        ${
          webcamUrl
            ? `<p>🔗 <a href="${webcamUrl}" style="color:#4A90E2;">Watch it live</a> as your creation comes to life.</p>`
            : `<p>🎥 Live stream is currently unavailable for this printer.</p>`
        }
        <p>Thank you for inspiring innovation with us!</p>
        <footer style="margin-top:20px; font-size:12px; color:#888;">
          Icepik’s Octo Manager &bull; Where imagination meets reality
        </footer>
      </div>
    `,
  };
}

function completed({ username, filename }) {
  return {
    subject: `🎉 Print completed successfully!`,
    html: `
      <div style="font-family: sans-serif; max-width:600px; margin:auto;">
        <h2 style="color:#F5A623;">Congratulations ${username}!</h2>
        <p>Your print <strong>${filename}</strong> has finished. We can’t wait to see your feedback!</p>
        <p>📦 We’re now preparing it for shipping—stay tuned for tracking details.</p>
        <p>Thanks for creating with IOM Prints.</p>
        <footer style="margin-top:20px; font-size:12px; color:#888;">
          Icepik’s Octo Manager &bull; Crafting your visions in 3D
        </footer>
      </div>
    `,
  };
}

function canceled({ username, filename }) {
  return {
    subject: `⚠️ Your print was canceled`,
    html: `
      <div style="font-family: sans-serif; max-width:600px; margin:auto;">
        <h2 style="color:#D0021B;">Hello ${username},</h2>
        <p>We’re sorry to let you know that your print <strong>${filename}</strong> was canceled.</p>
        <p>If you’d like assistance or wish to re-queue, reply to this email or visit your account dashboard.</p>
        <p>We appreciate your creativity and hope to help again soon.</p>
        <footer style="margin-top:20px; font-size:12px; color:#888;">
          Icepik’s Octo Manager &bull; Innovating responsibly
        </footer>
      </div>
    `,
  };
}

function shipped({ username, filename, trackingUrl }) {
  return {
    subject: `📦 Your print has shipped!`,
    html: `
      <div style="font-family: sans-serif; max-width:600px; margin:auto;">
        <h2 style="color:#9013FE;">Hi ${username},</h2>
        <p>Your print <strong>${filename}</strong> is on its way.</p>
        <p>🔍 Track your package: <a href="${trackingUrl}" style="color:#4A90E2;">${trackingUrl}</a></p>
        <p>We can’t wait for you to unbox your creation—thank you for printing with us!</p>
        <footer style="margin-top:20px; font-size:12px; color:#888;">
          Icepik’s Octo Manager &bull; Delivering innovation
        </footer>
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
};
