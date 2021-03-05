const couponModel = require('../models/coupon')

const register = coupon => couponModel.create(coupon)

const find = filter => couponModel.find(filter)

module.exports = {
  register,
  find
}
