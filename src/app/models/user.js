const mongoose = require('../../config/bd-connect')

const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  isAdmin: { type: Boolean, default: false },
  address: {
    street: { type: String, required: true },
    number: { type: String, required: true },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'userCollection', discriminatorKey: 'profile' })

module.exports = mongoose.model('userCollection', schema)
