const userModel = require('../models/user')

const findOne = async (id, options = {}) => userModel.findOne(
  { $or: [{ email: id }, { cpf: id }, { cnpj: id }] }, options
)

const findById = async (id, options = {}) => userModel.findById(id, options)

module.exports = {
  findOne,
  findById
}
