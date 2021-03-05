const mongoose = require('../../config/bd-connect')
const userModel = require('./user')

const applicantModel = userModel.discriminator('applicant',
  new mongoose.Schema({
    cpf: { type: String, required: true, unique: true },
    name: { type: String, required: true }
  })
)

module.exports = applicantModel
