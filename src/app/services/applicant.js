const lib = require('../lib/user')
const { encrypt } = require('../../auth/auth')
const { applicationSchema, updateSchema } = require('../../schemas/user')
const paramsValidator = require('../../middleware/validator')
const permission = require('../../middleware/permission')

/**
 * Register a new user
 * @param  {object} req - Express context
 * @param  {object} res - Express context
 * @param  {object} next - Express context
 * @return {object} Applicant and access token
 */
const register = async (req, res, next) => {
  try {
    const applicant = req.body
    await paramsValidator(applicationSchema, applicant)
    applicant.profile = 'applicant'
    const user = await lib.register(applicant)
    const token = await encrypt({ id: user._id }, '7d')

    res.status(200).json({ user, token })
  } catch (error) {
    next(error)
  }
}

/**
 * Update user' data
 * @param  {object} req - Express context
 * @param  {object} res - Express context
 * @param  {object} next - Express context
 * @return {object} Applicant
 */
const update = async (req, res, next) => {
  try {
    permission.checkIsApplicant(req.user.profile)

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
  update
}
