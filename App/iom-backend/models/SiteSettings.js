const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  _id: { type: String, default: 'public' },
  announcement: { type: String, default: '' },
  homeIntro: { type: String, default: 'Custom 3D prints. Purpose-built software. Hardware that works. We help people and businesses turn the next idea—or the next problem—into a practical solution.' },
  liveIntro: { type: String, default: 'Watch ED1 and ED2 at work. Cameras may be offline while we get the studio ready or between printing sessions.' },
  acceptingUploads: { type: Boolean, default: true },
  cameras: { ED1: { type: Boolean, default: true }, ED2: { type: Boolean, default: true } },
}, { timestamps: true });
module.exports = mongoose.model('SiteSettings', schema);
