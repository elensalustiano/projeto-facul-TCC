const joi = require('joi')

const couponSchema = joi.object().keys({
  title: joi.string().required().trim(),
  code: joi.string().required().trim(),
  companyName: joi.string().required().trim(),
  category: joi.string().required().trim(),
  type: joi.string().trim(),
  description: joi.string().trim(),
  logo: joi.string().trim()
})

module.exports = {
  couponSchema
}
