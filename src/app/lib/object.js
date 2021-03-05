const objectRepository = require('../repositories/object')
const { validationError } = require('./error-wrap')
const { objectStatus } = require('../../config/enum')
const emailLib = require('../lib/email')
const { emailSubject } = require('../../config/enum.json')

/**
 * Register a new object
 * @param  {object} object - Object's data
 * @return {Promise}
 */
const register = object => objectRepository.register(object)

/**
 * Search object(s) with base on a filter
 * @param  {object} filter - Filter
 * @return {array<object>} Object
 */
const search = async filter => {
  const { fields } = filter

  if (fields) {
    const text = fields.reduce((acc, { value }) => {
      if (value) return `${acc} ${value}`
      return acc
    }, '')

    return objectRepository.find({ ...filter, text })
  }

  return objectRepository.find(filter)
}

/**
 * Generate a 5 caracter code
 * @param  {string} value - Base to generate the code
 * @return {string} Code
 */
const generateCode = value => {
  const base = value.split('')
  const code = []

  while (code.length < 5) {
    const position = Math.floor(Math.random() * base.length)
    code.push(base[position])
  }

  return code.join('')
}

/**
 * Verify if solicit date is inside the expiry period
 * @param  {date} date - Date to add expiry period
 * @param  {integer} days - Expiry period
 * @return {boolean}
 */
const isSolicitedDateExpired = (date, days) => {
  const expiryDate = new Date(date)
  const dateNow = new Date()

  expiryDate.setDate(expiryDate.getDate() + days)
  expiryDate.setHours(0, 0, 0, 0)
  dateNow.setHours(0, 0, 0, 0)

  return dateNow > expiryDate
}

/**
 * Check if object is available to solicit
 * @param  {string} userId - User's id
 * @param  {string} objectId - Object's id
 */
const checkObjectIsSolicitable = async (userId, objectId) => {
  const object = await objectRepository.findById(objectId)

  if (!object) {
    throw validationError('Objeto não encontrado, verifique as informações.')
  }

  if (object.applicant && object.applicant.toString() === userId.toString()) {
    throw validationError('Objeto só pode ser solicitado uma vez.')
  }

  if (object.status === objectStatus.DEVOLVED) {
    throw validationError('Não é possível solicitar objeto que já foi devolvido.')
  }

  if (object.solicitedAt && !isSolicitedDateExpired(object.solicitedAt, 3)) {
    throw validationError('Não é possível reivindicar o objeto, pois o período de solicitação não expirou.')
  }
}

/**
 * Solicit recovery an object
 * @param  {object} userId - User's id
 * @param  {string} objectId - Object's id
 * @return {string} Devolution code
 */
const solicit = async (userId, objectId) => {
  try {
    await checkObjectIsSolicitable(userId, objectId)

    const devolutionCode = generateCode(objectId)
    const data = {
      devolutionCode,
      applicant: userId,
      solicitedAt: Date.now()
    }

    const { nModified } = await objectRepository.addSolicitation(objectId, data)

    if (!nModified) throw validationError('Erro ao solicitar objeto. Verifique as informações do objeto.')

    return devolutionCode
  } catch (error) {
    if (error.name === 'CastError') throw validationError('Id do objeto inválido.')
    throw error
  }
}

/**
 * Devolve an object according to institution and devolution code
 * @param  {string} institutionId - Institution's id
 * @param  {string} devolutionCode - Devolution code
 * @return {boolean}
 */
const devolve = async (institutionId, devolutionCode) => {
  const filter = {
    devolutionCode,
    institution: institutionId
  }

  const [object] = await findByFilter(filter)
  if (!object) throw validationError('Objeto não econtrado.')

  const { nModified } = await objectRepository.devolve(object._id)

  if (!nModified) {
    throw validationError('Ocorreu um erro ao efetuar devolução. Verfique se o objeto já foi devolvido.')
  }

  return true
}

/**
 * Update object' data
 * @param  {string} institutionId - Institution's id
 * @param  {object} object - Object
 * @return {object} Object
 */
const update = async (institutionId, object) => {
  try {
    const result = await objectRepository.update(institutionId, object)
    if (!result) throw validationError('Ocorreu um erro ao editar dados.')
    return result
  } catch (error) {
    if (error.name === 'CastError') throw validationError('Id do objeto inválido.')
    throw error
  }
}

/**
 * Find object(s) according to filter and options
 * @param  {object} filter - Info(s) to find in object
 * @param  {object} [options={}] - Additional search restriction
 * @return {Promise}
 */
const findByFilter = (filter, options = {}) => objectRepository.findByFilter(filter, options)

/**
 * Get object(s) related to user according to query fields
 * If there is no query fields, return all.
 * @param  {object} user - User's data
 * @param  {object} queryFields - Query params
 * @return {Promise}
 */
const getObject = (user, queryFields) => {
  const { _id: id, profile } = user
  const { devolutionCode, status } = queryFields
  const filter = { [profile]: id }

  if (devolutionCode) filter.devolutionCode = devolutionCode
  if (status) filter.status = status

  return findByFilter(filter, { [profile]: 0 })
}

/**
 * Get object(s) related to interested applicant according to status.
 * If there is no status, return all.
 * @param  {string} userId - User's id
 * @param  {string} status - Object's status
 * @return {Promise}
 */
const getObjectByInterested = (applicantId, status) => {
  const filter = { interestedApplicant: { $elemMatch: { applicantId } } }
  if (status) filter.status = status

  return findByFilter(filter, { interestedApplicant: 0, applicant: 0, devolutionCode: 0 })
}

/**
 * Cancel solicitation of object
 * @param  {string} userId - User's id
 * @param  {string} devolutionCode - Devolution code
 * @return {boolean}
 */
const cancelSolicitation = async (userId, devolutionCode) => {
  const propertyToRemove = {
    applicant: '',
    devolutionCode: '',
    solicitedAt: ''
  }
  const object = await objectRepository
    .cancelSolicitation(userId, devolutionCode, propertyToRemove)

  if (!object) {
    throw validationError('Ocorreu um erro ao cancelar solicitação do objeto. Verique o código de devolução.')
  }

  const [firstInterested] = object.interestedApplicant
  if (firstInterested) {
    const newDevolutionCode = await solicit(firstInterested.applicantId, object._id.toString())
    await deleteInterested(firstInterested.applicantId, object._id)

    const emailData = {
      email: firstInterested.email,
      templateVariable: {
        devolutionCode: newDevolutionCode,
        category: object.category,
        type: object.type
      }
    }

    emailLib.sendEmail(emailSubject.AUTOMATIC_SOLICIT_OBJECT, emailData)
  }

  return true
}

/**
 * Delete object if status is available and institution is creater
 * @param  {string} institutionId - Institution's id
 * @param  {string} objectId - Object's id
 * @return {boolean}
 */
const deleteObject = async (institutionId, objectId) => {
  try {
    const { deletedCount } = await objectRepository.deleteOne(institutionId, objectId)
    if (!deletedCount) throw validationError('Ocorreu um erro ao deletar objeto. Verifique se o objeto existe e pode ser deletado.')

    return true
  } catch (error) {
    if (error.name === 'CastError') throw validationError('Id do objeto inválido.')
    throw error
  }
}

/**
 * Register interest for object
 * @param  {string} userData.applicantId - Applicant's id
 * @param  {string} userData.email - Applicant's email
 * @param  {string} objectId - Object's id
 * @return {boolean}
 */
const registerInterest = async (userData, objectId) => {
  try {
    const { nModified } = await objectRepository.addInterested(userData, objectId)
    if (!nModified) throw validationError('Ocorreu um erro ao adicionar interesse pelo objecto.')

    return true
  } catch (error) {
    if (error.name === 'CastError') throw validationError('Id do objeto inválido.')
    throw error
  }
}

/**
 * Delete interest for object
 * @param  {string} applicantId - Applicant's id
 * @param  {string} objectId - Object's id
 * @return {boolean}
 */
const deleteInterested = async (applicantId, objectId) => {
  try {
    const { nModified } = await objectRepository.deleteInterested(applicantId, objectId)
    if (!nModified) throw validationError('Ocorreu um erro ao cancelar interesse.')

    return true
  } catch (error) {
    if (error.name === 'CastError') throw validationError('Id inválido.')
    throw error
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
