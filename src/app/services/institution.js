const lib = require('../lib/user')
const { encrypt } = require('../../auth/auth')
const { institutionSchema, updateSchema } = require('../../schemas/user')
const paramsValidator = require('../../middleware/validator')
const permission = require('../../middleware/permission')

/**
 * Register a new user
 * @param  {object} req - Express context
 * @param  {object} res - Express context
 * @param  {object} next - Express context
 * @return {object} Institution and access token
 */
const register = async (req, res, next) => {
  try {
    const institution = req.body
    await paramsValidator(institutionSchema, institution)
    institution.profile = 'institution'
    const user = await lib.register(institution)
    const token = await encrypt({ id: user._id }, '7d')

    res.status(200).json({ user, token })
  } catch (error) {
    next(error)
  }
}

/**
 * Get all institution
 * @param  {object} req - Express context
 * @param  {object} res - Express context
 * @param  {object} next - Express context
 * @return {array<object>} Institution
 */
const findAll = async (req, res, next) => {
  try {
    const institutions = await lib.getInstitutions()

    res.status(200).json(institutions)
  } catch (error) {
    next(error)
  }
}

/**
 * Update user' data
 * @param  {object} req - Express context
 * @param  {object} res - Express context
 * @param  {object} next - Express context
 * @return {object} Institution
 */
const update = async (req, res, next) => {
  try {
    permission.checkIsInstitution(req.user.profile)
    await paramsValidator(updateSchema, req.body)

    const user = await lib.update({
      ...req.body,
      _id: req.user._id,
      profile: req.user.profile
    })

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  findAll,
  update
}
