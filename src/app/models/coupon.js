const mongoose = require('../../config/bd-connect')

const couponSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, uppercase: true, required: true },
  companyName: { type: String, required: true },
  description: String,
  logo: String,
  category: { type: String, required: true },
  type: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'couponCollection' })

module.exports = mongoose.model('couponCollection', couponSchema)
