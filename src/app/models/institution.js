const mongoose = require('../../config/bd-connect')
const userModel = require('./user')

const institutionModel = userModel.discriminator('institution',
  new mongoose.Schema({
    cnpj: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    fantasyName: { type: String, required: true }
  })
)

module.exports = institutionModel
