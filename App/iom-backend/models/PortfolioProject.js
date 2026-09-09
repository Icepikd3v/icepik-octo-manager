const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  _id: String, title: String, category: String, description: String, body: String,
  date: String, stage: String, status: String, image: String, alt: String, externalUrl: String,
}, { timestamps: true });
module.exports = mongoose.model('PortfolioProject', schema);
