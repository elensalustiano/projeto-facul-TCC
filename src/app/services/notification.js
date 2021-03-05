const lib = require('../lib/notification')
const paramsValidator = require('../../middleware/validator')
const { objectSchema } = require('../../schemas/object')

/**
 * Register a new notification
 * @return {string} Message
 */
const register = async (req, res, next) => {
  try {
    await paramsValidator(objectSchema, req.body)
    const notification = {
      email: req.user.email,
      objectToFind: req.body
    }

    await lib.register(notification)

    res.status(200).json('Notificação salva.')
  } catch (error) {
    next(error)
  }
}

/**
 * Get all notification
 * @return {array<object>} notification
 */
const get = async (req, res, next) => {
  try {
    const notifications = await lib.get(req.user.email)

    res.status(200).json(notifications)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete notification
 * @return {string} Message
 */
const deleteNotification = async (req, res, next) => {
  try {
    await lib.deleteNotification(req.params.id)

    res.status(200).json('Notificação deletada.')
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  get,
  deleteNotification
}
