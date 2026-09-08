const mongoose = require('mongoose');
module.exports = mongoose.model('AdminAudit', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  printer: String, action: { type: String, required: true },
  result: { type: String, enum: ['pending', 'accepted', 'failed'], default: 'pending' },
}, { timestamps: true }));
