const mongoose = require('../../config/bd-connect')

const notificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  objectToFind: Object,
  objectFound: { type: mongoose.Schema.Types.ObjectId, ref: 'objectCollection' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'notificationCollection', collation: { locale: 'pt', strength: 1 } })

notificationSchema.index(
  { 'objectToFind.fields.value': 'text' },
  { default_language: 'portuguese' }
)

module.exports = mongoose.model('notificationCollection', notificationSchema)
