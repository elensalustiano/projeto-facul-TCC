const lib = require('../lib/category')
const paramsValidator = require('../../middleware/validator')
const { categorySchema, updateSchema } = require('../../schemas/category')
const permission = require('../../middleware/permission')

/**
 * Get all categories
 * @return {array<object>} Categories
 */
const get = async (req, res, next) => {
  try {
    const categories = await lib.get()

    res.status(200).json(categories)
  } catch (error) {
    next(error)
  }
}

/**
 * Register a new category
 * @return {string} Message
 */
const register = async (req, res, next) => {
  try {
    permission.checkIsAdmin(req.user.isAdmin)

    await paramsValidator(categorySchema, req.body)
    await lib.register(req.body)

    res.status(200).json('Cadastrada com sucesso.')
  } catch (error) {
    next(error)
  }
}

/**
 * Update category' data
 * @return {string} Message
 */
const update = async (req, res, next) => {
  try {
    permission.checkIsAdmin(req.user.isAdmin)

    await paramsValidator(updateSchema, req.body)
    await lib.update(req.body)

    res.status(200).json('Editado com sucesso.')
  } catch (error) {
    next(error)
  }
}

/**
 * Delete category
 * @return {string} Message
 */
const deleteCategory = async (req, res, next) => {
  try {
    permission.checkIsAdmin(req.user.isAdmin)

    await lib.deleteCategory(req.params.id)

    res.status(200).json('Categoria deletada.')
  } catch (error) {
    next(error)
  }
}

module.exports = {
  get,
  register,
  update,
  deleteCategory
}
