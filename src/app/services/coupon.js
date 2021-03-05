const lib = require('../lib/coupon')
const paramsValidator = require('../../middleware/validator')
const { couponSchema } = require('../../schemas/coupon')

/**
 * Register a new coupon
 * @return {string} Message
 */
const register = async (req, res, next) => {
  try {
    await paramsValidator(couponSchema, req.body)
    await lib.register(req.body)

    res.status(200).json('Cadastrado com sucesso.')
  } catch (error) {
    next(error)
  }
}

/**
 * Get coupon
 * @param  {string} [req.query.category] - Category
 * @param  {string} [req.query.type] - Subcategory
 * @return {array<object>} Coupon
 */
const get = async (req, res, next) => {
  try {
    const coupons = await lib.get(req.query)

    res.status(200).json(coupons)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  get
}
