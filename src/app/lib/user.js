const bcrypt = require('bcrypt')

const userRespository = require('../repositories/user')
const applicantRepository = require('../repositories/applicant')
const institutionRepository = require('../repositories/institution')
const { validationError, unauthorizedError } = require('./error-wrap')

/**
 * Generate a hash
 * @param  {string} value - Value that will generate a hash
 * @return {string} Hash
 */
const generateHash = value => bcrypt.hash(value, 8)

/**
 * Check if the hash was generated with base in that value
 * @param  {string} value - Value
 * @param  {string} hash    Hash
 * @return {boolean}
 */
const compareHash = async (value, hash) => bcrypt.compare(value, hash)

/**
 * Register a new user
 * @param  {object} object - User's data
 * @return {object} Object
 */
const register = async data => {
  try {
    data.password = await generateHash(data.password)
    let user

    switch (data.profile) {
      case 'institution':
        user = await institutionRepository.register(data)
        break
      default:
        user = await applicantRepository.register(data)
    }

    if (!user) throw validationError('Erro ao registrar usuário. Verifique se o usuário já existe.')
    user.password = undefined

    return user
  } catch (error) {
    if (error.name === 'MongoError') throw validationError('Erro ao registrar usuário. Verifique se o usuário já existe.')
    throw error
  }
}

/**
 * Update user' data
 * @param  {object} user - User
 * @return {object} User
 */
const update = async user => {
  const { _id, ...userUpdate } = user

  if (user.password) userUpdate.password = await generateHash(user.password)

  let result
  switch (user.profile) {
    case 'institution':
      result = await institutionRepository.update(_id, userUpdate)
      break
    default:
      result = await applicantRepository.update(_id, userUpdate)
  }

  if (!result) throw validationError('Ocorreu um erro ao editar dados.')

  return result
}

/**
 * Get all institution
 * @return {Promise}
 */
const getInstitutions = async () => institutionRepository.find()

/**
 * Get an user
 * @param  {string} id - User's id
 * @param  {object} [options={}] - Additional search restriction
 * @return {object} User
 */
const getUser = async (id, options = {}) => {
  const user = await userRespository.findOne(id, options)
  if (!user) throw unauthorizedError('Usuário não encontrado.')
  return user
}

/**
 * Get an user by mongodb objectId
 * @param  {string} id - User's objectId
 * @param  {object} [options={}] - Additional search restriction *
 * @return {object} User
 */
const getUserById = async (id, options = {}) => {
  const user = await userRespository.findById(id, options)
  if (!user) throw unauthorizedError('Usuário não encontrado.')
  return user
}

/**
 * Do login
 * @param  {string} id - User's id
 * @param  {string} password - User's password
 * @return {object} User
 */
const login = async (id, password) => {
  const user = await getUser(id, { object: 0 })
  const isValidPass = await compareHash(password, user.password)
  if (!isValidPass) throw unauthorizedError('Usuário não encontrado.')

  user.password = undefined
  return user
}

module.exports = {
  register,
  update,
  getInstitutions,
  getUser,
  getUserById,
  login
}
