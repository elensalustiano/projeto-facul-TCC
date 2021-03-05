const lib = require('../lib/user')
const { encrypt, dencrypt } = require('../../auth/auth')
const { loginSchema, passwordRecoverySchema, changePasswordSchema } = require('../../schemas/user')
const paramsValidator = require('../../middleware/validator')
const { emailSubject } = require('../../config/enum.json')
const emailLib = require('../lib/email')

/**
 * Do login
 * @param  {object} req - Express context
 * @param  {object} res - Express context
 * @param  {object} next - Express context
 * @return {object} User and access token
 */
const login = async (req, res, next) => {
  try {
    await paramsValidator(loginSchema, req.body)

    const user = await lib.login(req.body.id, req.body.password)
    const token = await encrypt({ id: user._id }, '7d')

    res.status(200).json({ user, token })
  } catch (error) {
    next(error)
  }
}

/**
 * Send email with instruction to change password
 * @param  {object} req - Express context
 * @param  {object} res - Express context
 * @param  {object} next - Express context
 * @return {object} Message
 */
const passwordRecovery = async (req, res, next) => {
  try {
    await paramsValidator(passwordRecoverySchema, req.body)
    const { id } = req.body
    const data = await lib.getUser(id)

    const token = await encrypt({ token: data._id, profile: data.profile }, '1h')
    const url = `${req.body.url}?token=${token}`

    const emailData = {
      email: data.email,
      templateVariable: { url, name: data.name || data.fantasyName }
    }

    await emailLib.sendEmail(emailSubject.PASS_RECOVERY, emailData)
    res.status(200).json('Email enviado.')
  } catch (error) {
    next(error)
  }
}

/**
 * Change user's password
 * @param  {object} req - Express context
 * @param  {object} res - Express context
 * @param  {object} next - Express context
 * @return {object} Message
 */
const changePassword = async (req, res, next) => {
  try {
    await paramsValidator(changePasswordSchema, req.body)
    const { password } = req.body

    const { data: { token, profile } } = await dencrypt(req.body.token)
    await lib.update({ _id: token, profile, password })

    res.status(200).json('Senha trocada.')
  } catch (error) {
    next(error)
  }
}

module.exports = {
  login,
  passwordRecovery,
  changePassword
}
