const institutionModel = require('../models/institution')

const register = async institution => institutionModel.create(institution)

const find = async () => institutionModel.find({ profile: 'institution' }, { password: 0 })

const update = async (id, data) => institutionModel.findByIdAndUpdate(
  id,
  data,
  { new: true, fields: { password: 0 } }
)

module.exports = { register, find, update }
