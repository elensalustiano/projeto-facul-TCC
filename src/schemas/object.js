const joi = require('joi')

const objectSchema = joi.object().keys({
  category: joi.string().required().trim(),
  type: joi.string().required().trim(),
  foundDate: joi.date().required(),
  images: joi.array().items(joi.string().trim()).min(1),
  fields: joi.array().items(joi.object().keys({
    name: joi.string().required().trim(),
    value: joi.string().required().trim()
  })).required().min(1)
})

const solicitSchema = joi.object().keys({
  objectId: joi.string().required().trim()
})

const devolutionCodeSchema = joi.object().keys({
  devolutionCode: joi.string().required().trim()
})

const searchSchema = joi.object().keys({
  category: joi.string().trim(),
  type: joi.string().trim(),
  foundDate: joi.date(),
  images: joi.array().items(joi.string().trim()).min(1),
  fields: joi.array().items(joi.object().keys({
    name: joi.string().trim(),
    value: joi.string().trim()
  })).min(1)
})

const updateSchema = searchSchema.concat(joi.object().keys({
  _id: joi.string().required().trim()
}))

module.exports = {
  objectSchema,
  solicitSchema,
  devolutionCodeSchema,
  updateSchema,
  searchSchema
}
