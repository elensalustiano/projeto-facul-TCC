const notificationModel = require('../models/notification')

const register = notification => notificationModel.create(notification)

const findByObject = (filter) => {
  const query = {
    'objectToFind.category': filter.category,
    'objectToFind.type': filter.type,
    'objectToFind.foundDate': { $gte: filter.foundDate }
  }

  return notificationModel.find(
    { ...query, $text: { $search: filter.text }, objectFound: { $exists: false } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } })
}

const addObjectFound = (id, objectId) => notificationModel.updateOne(
  { _id: id },
  { objectFound: objectId }
)

const find = (email) => notificationModel.find({ email }).populate({
  path: 'objectFound',
  populate: { path: 'institution', select: '-password' }
})

const deleteOne = notificationId => notificationModel.deleteOne({ _id: notificationId })

module.exports = {
  register,
  findByObject,
  addObjectFound,
  find,
  deleteOne
}
