const lib = require('../lib/object')
const notificationLib = require('../lib/notification')
const {
  objectSchema,
  solicitSchema,
  devolutionCodeSchema,
  updateSchema,
  searchSchema
} = require('../../schemas/object')
const paramsValidator = require('../../middleware/validator')
const { emailSubject } = require('../../config/enum.json')
const emailLib = require('../lib/email')
const permission = require('../../middleware/permission')

/**
 * Register a new object
 * @param  {object} req.user - User's info receive by auth middleware
 * @return {string} Message
 */
const register = async (req, res, next) => {
  try {
    permission.checkIsInstitution(req.user.profile)
    await paramsValidator(objectSchema, req.body)

    const object = req.body

    const { _id } = await lib.register({ ...object, institution: req.user._id })

    notificationLib.checkNotifications({ ...object, _id })

    res.status(200).json('Cadastrado com sucesso.')
  } catch (error) {
    next(error)
  }
}

/**
 * Search an object with base on a filter
 * @return {object} Object
 */
const search = async (req, res, next) => {
  try {
    await paramsValidator(searchSchema, req.body)
    const objects = await lib.search(req.body)

    res.status(200).json(objects)
  } catch (error) {
    next(error)
  }
}

/**
 * Solicit recovery an object
 * @param  {object} req.user - User's info receive by auth middleware
 * @return {string} Devolution code
 */
const solicit = async (req, res, next) => {
  try {
    permission.checkIsApplicant(req.user.profile)
    await paramsValidator(solicitSchema, req.body)

    const devolutionCode = await lib.solicit(req.user._id, req.body.objectId)

    const emailData = {
      email: req.user.email,
      templateVariable: { name: req.user.name, devolutionCode }
    }

    emailLib.sendEmail(emailSubject.SOLICIT_OBJECT, emailData)

    res.status(200).json(devolutionCode)
  } catch (error) {
    next(error)
  }
}

/**
 * Devolve an object
 * @param  {object} req.user - User's info receive by auth middleware
 * @return {string} Message
 */
const devolve = async (req, res, next) => {
  try {
    permission.checkIsInstitution(req.user.profile)
    await paramsValidator(devolutionCodeSchema, req.body)

    await lib.devolve(req.user._id, req.body.devolutionCode)

    res.status(200).json('Objeto devolvido.')
  } catch (error) {
    next(error)
  }
}

/**
 * Update object' data
 * @param  {object} req.user - User's info receive by auth middleware
 * @return {object} Object
 */
const update = async (req, res, next) => {
  try {
    permission.checkIsInstitution(req.user.profile)
    await paramsValidator(updateSchema, req.body)

    const result = await lib.update(req.user._id, req.body)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * Get user's objects. Allow filter the object by status and/or devolution code
 * @param  {object} req.user - User's info receive by auth middleware
 * @param  {string} [req.query.devolutionCode] - Object's devolution code
 * @param  {string} [req.query.status] - Object's status
 * @return {array<object>} Object
 */
const getObject = async (req, res, next) => {
  try {
    const object = await lib.getObject(req.user, req.query)

    res.status(200).json(object)
  } catch (error) {
    next(error)
  }
}

/**
 * Get user's objects. Allow filter the object by status and/or devolution code
 * @param  {object} req.user - User's info receive by auth middleware
 * @param  {string} [req.query.status] - Object's status
 * @return {array<object>} Object
 */
const getObjectByInterested = async (req, res, next) => {
  try {
    permission.checkIsApplicant(req.user.profile)

    const object = await lib.getObjectByInterested(req.user._id, req.query.status)

    res.status(200).json(object)
  } catch (error) {
    next(error)
  }
}

/**
 * Update object' data
 * @param  {object} req.user - User's info receive by auth middleware
 * @return {object} Object
 */
const cancelSolicitation = async (req, res, next) => {
  try {
    await paramsValidator(devolutionCodeSchema, req.body)
    await lib.cancelSolicitation(req.user._id, req.body.devolutionCode)

    res.status(200).json('Solicitação do objeto cancelada.')
  } catch (error) {
    next(error)
  }
}

/**
 * Delete object
 * @param  {object} req.user - User's info receive by auth middleware
 * @return {string} Message
 */
const deleteObject = async (req, res, next) => {
  try {
    permission.checkIsInstitution(req.user.profile)

    await lib.deleteObject(req.user._id, req.params.id)

    res.status(200).json('Objeto deletado.')
  } catch (error) {
    next(error)
  }
}

/**
 * Register interest in object
 * @param  {object} req.user - User's info receive by auth middleware
 * @return {string} Message
 */
const registerInterest = async (req, res, next) => {
  try {
    permission.checkIsApplicant(req.user.profile)
    await paramsValidator(solicitSchema, req.body)

    const applicant = {
      applicantId: req.user._id,
      email: req.user.email
    }

    await lib.registerInterest(applicant, req.body.objectId)

    res.status(200).json('Adicionado na lista de interessados.')
  } catch (error) {
    next(error)
  }
}

/**
 * Delete interest for object
 * @param  {object} req.user - User's info receive by auth middleware
 * @return {string} Message
 */
const deleteInterested = async (req, res, next) => {
  try {
    permission.checkIsApplicant(req.user.profile)

    await lib.deleteInterested(req.user._id, req.params.objectId)

    res.status(200).json('Interesse cancelado.')
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  search,
  solicit,
  devolve,
  update,
  getObject,
  cancelSolicitation,
  deleteObject,
  registerInterest,
  getObjectByInterested,
  deleteInterested
}
