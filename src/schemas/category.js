const joi = require('joi')

const categorySchema = joi.object().keys({
  name: joi.string().required().trim(),
  type: joi.array().items(joi.string().trim()).required().min(1),
  fields: joi.array().items(joi.object().keys({
    name: joi.string().required().trim(),
    options: joi.array().items([joi.string().trim(), joi.number()])
  })).required().min(1)
})

const updateSchema = joi.object().keys({
  _id: joi.string().required().trim(),
  type: joi.array().items(joi.string().trim()).min(1),
  fields: joi.array().items(joi.object().keys({
    name: joi.string().trim(),
    options: joi.array().items([joi.string().trim(), joi.number()])
  })).min(1)
})

module.exports = {
  categorySchema,
  updateSchema
}
