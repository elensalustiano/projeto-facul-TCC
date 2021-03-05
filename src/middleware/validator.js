const { validationError } = require('../app/lib/error-wrap')

module.exports = (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false })
  if (error) {
    const errorMessage = error.details.map(elem =>
      ({
        field: elem.path[0],
        error: elem.message
      })
    )

    throw validationError(errorMessage)
  }
}
