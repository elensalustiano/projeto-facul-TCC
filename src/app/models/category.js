const mongoose = require('../../config/bd-connect')

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: [{ type: String, required: true }],
  fields: [{
    name: { type: String, required: true },
    options: [String]
  }],
  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now }
}, { collection: 'categoryCollection', collation: { locale: 'pt', strength: 1 } })

module.exports = mongoose.model('categoryCollection', categorySchema)
