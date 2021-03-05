const categoryModel = require('../models/category')

const find = () => categoryModel.find()

const findOne = filter => categoryModel.findOne(filter)

const register = category => categoryModel.create(category)

const addFieldOrType = ({ categoryId, propName, propValue }) => categoryModel.updateOne(
  { _id: categoryId },
  { $addToSet: { [propName]: { $each: propValue } }, updateAt: Date.now() }
)

const updateField = ({ categoryId, field }) => categoryModel.updateOne(
  { _id: categoryId, 'fields.name': field.name },
  { 'fields.$.options': field.options || [], updateAt: Date.now() }
)

const RemoveType = ({ categoryId, type }) => categoryModel.updateOne(
  { _id: categoryId },
  { $pull: { type: { $in: type } }, updateAt: Date.now() }
)

const RemoveField = ({ categoryId, name }) => categoryModel.updateOne(
  { _id: categoryId },
  { $pull: { fields: { name } }, updateAt: Date.now() }
)

const deleteOne = categoryId => categoryModel.deleteOne({ _id: categoryId })

module.exports = {
  find,
  findOne,
  register,
  addFieldOrType,
  updateField,
  RemoveType,
  RemoveField,
  deleteOne
}
