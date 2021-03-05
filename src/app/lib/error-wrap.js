/**
 * Error formatter of type Bad Request
 * @param  {string} message - Message
 * @return {object} Error
 */
const validationError = message => ({
  statusCode: 400,
  name: 'Bad Request',
  message
})

/**
 * Error formatter of type Server Error
 * @param  {string} message - Message
 * @return {object} Error
 */
const serverError = message => ({
  statusCode: 500,
  name: 'Internal Server Error',
  message
})

/**
 * Error formatter of type Unauthorized
 * @param  {string} message - Message
 * @return {object} Error
 */
const unauthorizedError = message => ({
  statusCode: 401,
  name: 'Unauthorized',
  message
})

/**
 * Error formatter of type Forbidden
 * @return {object} Error
 */
const forbiddenError = () => ({
  statusCode: 403,
  name: 'Forbidden',
  message: 'Acesso negado ao recurso.'
})

module.exports = {
  validationError,
  serverError,
  unauthorizedError,
  forbiddenError
}
