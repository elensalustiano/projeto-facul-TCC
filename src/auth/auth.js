const { sign, verify } = require('jsonwebtoken')
const { jwtSecret } = require('../config/config')

/**
 * Generate JWT token
 * @param  {object} data - Value that will generate the token
 * @param  {string} exp - Duration time of token
 * @return {string} Token
 */
const encrypt = (data, exp) => sign({ data }, jwtSecret, { expiresIn: exp })

/**
 * Dencrypt JWT token
 * @param  {object} token - JWT token
 * @return {object} Payload
 */
const dencrypt = token => verify(token, jwtSecret)

module.exports = {
  encrypt,
  dencrypt
}
