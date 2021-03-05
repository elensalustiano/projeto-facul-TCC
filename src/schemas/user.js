const joi = require('joi')

const schema = joi.object().keys({
  email: joi.string().email().required().trim(),
  password: joi.string().max(15).required().trim(),
  phone: joi.string().required().trim(),
  address: joi.object().required().keys({
    street: joi.string().max(100).required().trim(),
    number: joi.number().required(),
    neighborhood: joi.string().max(100).required().trim(),
    city: joi.string().max(100).required().trim(),
    state: joi.string().max(100).required().trim(),
    zipCode: joi.string().required().trim()
  })
})

const institutionSchema = schema.concat(joi.object().keys({
  cnpj: joi.string().min(14).max(14).required().regex(/^\d{14}$/).trim(),
  companyName: joi.string().max(100).required().trim(),
  fantasyName: joi.string().max(100).required().trim()
}))

const applicationSchema = schema.concat(joi.object().keys({
  cpf: joi.string().min(11).max(11).required().regex(/^\d{11}$/).trim(),
  name: joi.string().min(3).max(30).required().trim()
}))

const loginSchema = joi.object({
  id: joi.string().required().trim(),
  password: joi.string().max(15).required().trim()
})

const passwordRecoverySchema = joi.object({
  id: joi.string().required().trim(),
  url: joi.string().required().trim()
})

const changePasswordSchema = joi.object({
  password: joi.string().required().trim(),
  token: joi.string().required().trim()
})

const updateSchema = joi.object().keys({
  email: joi.string().email().trim(),
  password: joi.string().max(15).trim(),
  phone: joi.string().trim(),
  companyName: joi.string().max(100).trim(),
  fantasyName: joi.string().max(100).trim(),
  name: joi.string().min(3).max(30).trim(),
  address: joi.object().keys({
    street: joi.string().max(100).trim(),
    number: joi.number(),
    neighborhood: joi.string().max(100).trim(),
    city: joi.string().max(100).trim(),
    state: joi.string().max(100).trim(),
    zipCode: joi.string().trim()
  })
})

module.exports = {
  institutionSchema,
  applicationSchema,
  loginSchema,
  passwordRecoverySchema,
  changePasswordSchema,
  updateSchema
}
