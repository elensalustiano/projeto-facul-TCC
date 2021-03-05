const { serverError } = require('../app/lib/error-wrap')

module.exports = (err, req, res, next) => {
  console.error('err: ', err)
  if (!err.statusCode) err = serverError('Ocorreu um erro inesperado, tente novamente.')
  res.status(err.statusCode).json(err)
}
