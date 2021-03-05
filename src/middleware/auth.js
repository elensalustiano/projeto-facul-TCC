const { dencrypt } = require('../auth/auth')
const { getUserById } = require('../app/lib/user')
const { unauthorizedError } = require('../app/lib/error-wrap')

module.exports = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const [type, token] = req.headers.authorization.split(' ')
      if (type === 'Bearer' && token) {
        const { data: { id } } = await dencrypt(token)
        req.user = await getUserById(id, { password: 0 })
        next()
      }
      else throw new Error('JsonWebTokenError')
    }
    else throw new Error('JsonWebTokenError')
  } catch (error) {
    next(unauthorizedError('Não autorizado.'))
  }
}
