const mongoose = require('../../config/bd-connect')

const objectSchema = new mongoose.Schema({
  category: { type: String, required: true, index: true },
  type: { type: String, required: true },
  foundDate: { type: Date, required: true },
  fields: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'userCollection', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'userCollection' },
  devolutionCode: String,
  solicitedAt: Date,
  devolvedAt: Date,
  images: [String],
  status: { type: Number, default: 0 },
  interestedApplicant: [{
    applicantId: String,
    email: String,
    solicitedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now }
}, { collection: 'objectCollection', collation: { locale: 'pt', strength: 1 } })

objectSchema.index({ 'fields.value': 'text' }, { default_language: 'portuguese' })

module.exports = mongoose.model('objectCollection', objectSchema)
