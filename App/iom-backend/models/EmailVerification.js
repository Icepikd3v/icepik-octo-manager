const mongoose = require('mongoose');
module.exports = mongoose.model('EmailVerification', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  tokenHash: { type: String, required: true }, codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true }, attempts: { type: Number, default: 0 },
  lastRequestedAt: { type: Date, default: Date.now },
}));
