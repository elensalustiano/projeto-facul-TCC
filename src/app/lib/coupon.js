const couponRepository = require('../repositories/coupon')

/**
 * Register a new coupon
 * @param  {object} coupon - Coupon's data
 * @return {Promise}
 */
const register = coupon => couponRepository.register(coupon)

/**
 * Get coupons
 * @param  {string} category - Category
 * @param  {string} type - Subcategory
 * @return {Promise}
 */
const get = ({ category, type }) => {
  const filter = {}

  if (category) filter.category = category
  if (type) filter.type = type

  return couponRepository.find(filter)
}

module.exports = {
  register,
  get
}
