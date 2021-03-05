const notificationRepository = require('../repositories/notification')
const emailLib = require('../lib/email')
const { emailSubject } = require('../../config/enum.json')
const { validationError } = require('./error-wrap')

/**
 * Register a new notification
 * @param  {object} notification - notification's data
 * @return {Promise}
 */
const register = notification => notificationRepository.register(notification)

/**
 * Check if has object alike and save it
 * @param  {object} object - object's data
 */
const checkNotifications = async object => {
  const text = object.fields.reduce((acc, { value }) => {
    if (value) return `${acc} ${value}`
    return acc
  }, '')

  const [notification] = await notificationRepository.findByObject({ ...object, text })

  if (notification) {
    await addObjectFound(notification._id, object._id)

    const emailData = {
      email: notification.email,
      templateVariable: {
        category: notification.objectToFind.category,
        type: notification.objectToFind.type
      }
    }

    emailLib.sendEmail(emailSubject.NOTIFICATION, emailData)
  }
}

/**
 * Save object in notification
 * @param  {string} id - notification's id
 * @param  {string} objectId - object's id
 * @return {Promise}
 */
const addObjectFound = (id, objectId) => notificationRepository.addObjectFound(id, objectId)

/**
 * Get all notifications
 * @return {Promise}
 */
const get = email => notificationRepository.find(email)

/**
 * Delete notification
 * @param  {string} notificationId - notification's id
 * @return {boolean}
 */
const deleteNotification = async notificationId => {
  try {
    const { deletedCount } = await notificationRepository.deleteOne(notificationId)
    if (!deletedCount) throw validationError('Ocorreu um erro ao deletar notificação.')

    return true
  } catch (error) {
    if (error.name === 'CastError') throw validationError('Id inválido.')
    throw error
  }
}

module.exports = {
  register,
  checkNotifications,
  get,
  deleteNotification
}
