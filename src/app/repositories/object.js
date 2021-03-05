const objectModel = require('../models/object')
const { objectStatus } = require('../../config/enum')

const register = object => objectModel.create(object)

const find = filter => {
  const { foundDate, category, type, text } = filter
  const searchFields = text ? { $text: { $search: text } } : {}

  return objectModel.find(
    { category, type, foundDate: { $gte: foundDate }, ...searchFields },
    { score: { $meta: 'textScore' }, devolutionCode: 0 }
  ).populate('institution', '-password')
    .sort({ score: { $meta: 'textScore' } })
}

const addSolicitation = (id, data) => objectModel.updateOne(
  { _id: id, status: { $ne: objectStatus.DEVOLVED } },
  { status: objectStatus.SOLICITADED, ...data }
)

const findById = async id => objectModel.findById(id)

const devolve = id => objectModel.updateOne(
  { _id: id, status: objectStatus.SOLICITADED },
  { status: objectStatus.DEVOLVED, devolvedAt: Date.now() }
)

const update = (institutionId, { _id, ...data }) => objectModel.findOneAndUpdate(
  { _id, institution: institutionId, status: { $ne: objectStatus.DEVOLVED } },
  { ...data, updateAt: Date.now() },
  { new: true }
).populate('institution', '-password')
  .populate('applicant', '-password')

const findByFilter = (filter, options = {}) => objectModel.find(filter, options)
  .populate('applicant', '-password')
  .populate('institution', '-password')

const cancelSolicitation = (userId, devolutionCode, propertyToRemove) => objectModel.findOneAndUpdate(
  {
    devolutionCode,
    $or: [{ institution: userId }, { applicant: userId }],
    status: objectStatus.SOLICITADED
  },
  { status: objectStatus.AVAILABLE, updateAt: Date.now(), $unset: propertyToRemove }
)

const getTypeCount = (category, type) => objectModel.countDocuments({ category, type })

const getFieldCount = (category, fieldName) => objectModel.countDocuments({ category, 'fields.name': fieldName })

const getCategoryCount = category => objectModel.countDocuments({ category })

const deleteOne = (institutionId, objectId) => objectModel.deleteOne(
  { institution: institutionId, _id: objectId, status: objectStatus.AVAILABLE }
)

const addInterested = (userData, objectId) => objectModel.updateOne(
  {
    _id: objectId,
    status: objectStatus.SOLICITADED,
    applicant: { $ne: userData.applicantId },
    'interestedApplicant.applicantId': { $ne: userData.applicantId }
  },
  { $push: { interestedApplicant: userData } }
)

const deleteInterested = (applicantId, objectId) => objectModel.updateOne(
  { _id: objectId },
  { $pull: { interestedApplicant: { applicantId } } }
)

module.exports = {
  register,
  find,
  findById,
  findByFilter,
  addSolicitation,
  devolve,
  update,
  cancelSolicitation,
  getTypeCount,
  getFieldCount,
  getCategoryCount,
  deleteOne,
  addInterested,
  deleteInterested
}
