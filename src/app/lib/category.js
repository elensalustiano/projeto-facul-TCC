const categoryRepository = require('../repositories/category')
const objectRepository = require('../repositories/object')
const { validationError } = require('./error-wrap')

/**
 * Get all categories
 * @return {array<object>} Categories
 */
const get = () => categoryRepository.find()

/**
 * Check if category exists
 * @param  {string} name - Category's name
 */
const checkCategoryExists = async name => {
  const registered = await categoryRepository.findOne({ name })
  if (registered) throw validationError(`Categoria ${name} é similar a ${registered.name} já cadastrada.`)
}

/**
 * Register a new category
 * @param  {object} category - Category's data
 * @return {Promise}
 */
const register = async category => {
  await checkCategoryExists(category.name)
  return categoryRepository.register(category)
}

/**
 * Add fields or types into category
 * @param {string} categoryId - Category's id
 * @param {string} propName - Property name (fields or type)
 * @param {array} propValue - Property value
 */
const addFieldOrType = async (categoryId, propName, propValue) => {
  const result = await categoryRepository.addFieldOrType({
    categoryId,
    propName,
    propValue
  })

  if (result.nModified === 0) throw validationError('Ocorreu um erro ao editar dados.')
}

/**
 * Search in object collection and get number of time that a specific type appear
 * @param  {string} categoryName - Category's name
 * @param  {array} type - Category's type
 * @return {object}
 */
const getTotalTypeInUse = async (categoryName, type) => {
  const totalInUse = await objectRepository.getTypeCount(categoryName, type)
  return { element: type, totalInUse }
}

/**
 * Search in object collection and get number of time that a specific field appear
 * @param  {string} categoryName - Category's name
 * @param  {string} fieldName - Field's name
 * @return {object}
 */
const getTotalFieldInUse = async (categoryName, fieldName) => {
  const totalInUse = await objectRepository.getFieldCount(categoryName, fieldName)
  return { element: fieldName, totalInUse, categoryName }
}

/**
 * Filter elements that can be remove. Callback to array reduce method
 * @param  {array} accumulator - Value returned on last callback invocation
 * @param  {array} currentValue - The current element being processed in the array
 * @return {array}
 */
const getElementsCanRemove = (accumulator, currentValue) => {
  if (!currentValue.totalInUse) return [...accumulator, currentValue.element]
  return [...accumulator]
}

/**
 * Create object with separate field by operation (add, remove and update)
 * @param  {array<object>} newFields - New category fields
 * @param  {array<object>} currentFields - Current category fields
 * @return {object} fieldsToAdd: Fields in common
 * fieldsToRemove: Fields contain in the current category but not in the new one
 * fieldsToAdd: Fields contain in the new category but not in the current
 */
const getFieldsByOperation = (newFields, currentFields) => {
  const fieldsToUpdate = newFields.filter(field => currentFields.findIndex(elem => elem.name === field.name) !== -1)
  const fieldsToRemove = currentFields.filter(field => newFields.findIndex(elem => elem.name === field.name) === -1)
  const fieldsToAdd = newFields.filter(field => currentFields.findIndex(elem => elem.name === field.name) === -1)

  return {
    fieldsToUpdate,
    fieldsToRemove,
    fieldsToAdd
  }
}

/**
 * Execute operation to add, remove and/or update fields in category
 * @param  {object} currentCategory - Current category data (saved in database)
 * @param  {object} updateCategory - New category data
 */
const updateFields = async (currentCategory, updateCategory) => {
  try {
    const { _id: categoryId, name: categoryName } = currentCategory
    const {
      fieldsToUpdate,
      fieldsToRemove,
      fieldsToAdd
    } = getFieldsByOperation(updateCategory.fields, currentCategory.fields)

    const totalUseOfFieldToRemove = await Promise.all(fieldsToRemove.map(elem => getTotalFieldInUse(categoryName, elem.name)))
    const fieldsCanRemove = totalUseOfFieldToRemove.reduce(getElementsCanRemove, [])

    await Promise.all(fieldsCanRemove.map(name => categoryRepository.RemoveField({ categoryId, name })))

    await Promise.all(fieldsToUpdate.map(field => categoryRepository.updateField({ categoryId, field })))

    await addFieldOrType(categoryId, 'fields', fieldsToAdd)
  } catch (error) {
    throw validationError('Ocorreu um erro ao editar categoria.')
  }
}

/**
 * Execute operation to add, remove type in category
 * @param  {object} currentCategory - Current category data (saved in database)
 * @param  {object} updateCategory - New category data
 */
const updateType = async (currentCategory, updateCategory) => {
  try {
    const { _id: categoryId, name: categoryName } = currentCategory

    const typeToRemove = currentCategory.type.filter(type => !updateCategory.type.includes(type))
    const totalTypeToRemoveInUse = await Promise.all(typeToRemove.map(elem => getTotalTypeInUse(categoryName, elem)))
    const typeCanRemove = totalTypeToRemoveInUse.reduce(getElementsCanRemove, [])

    await categoryRepository.RemoveType({ categoryId, type: typeCanRemove })
    await addFieldOrType(categoryId, 'type', updateCategory.type)
  } catch (error) {
    throw validationError('Ocorreu um erro ao editar categoria.')
  }
}

/**
 * Get an category by mongodb objectId
 * @param  {string} categoryId - Category's objectId
 * @return {object}
 */
const getCategoryById = async categoryId => {
  try {
    const category = await categoryRepository.findOne({ _id: categoryId })
    if (!category) throw validationError('Categoria não encontrada.')

    return category
  } catch (error) {
    if (error.name === 'CastError') throw validationError('Id da categoria inválido.')
    throw error
  }
}

/**
 * Update category' data. split fields by operation
 * @param  {object} category - Category
 * @return {boolean}
 */
const update = async category => {
  const { _id: categoryId, fields, type } = category
  const currentCategory = await getCategoryById(categoryId)

  if (type && type.length) await updateType(currentCategory, category)

  if (fields && fields.length) await updateFields(currentCategory, category)

  return true
}

/**
 * Search in object collection and get number of time that a specific category appear
 * @param  {string} categoryName - Category's name
 * @return {Promise}
 */
const getTotalCategoryInUse = async categoryId => {
  const { name } = await getCategoryById(categoryId)

  return objectRepository.getCategoryCount(name)
}

/**
 * Delete category if there is no object using it
 * @param  {string} categoryId - Category's id
 */
const deleteCategory = async categoryId => {
  try {
    const totalInUse = await getTotalCategoryInUse(categoryId)
    if (totalInUse) throw validationError('Categoria não pode ser deletada, pois está sendo usada.')

    const { deletedCount } = await categoryRepository.deleteOne(categoryId)
    if (!deletedCount) throw validationError('Ocorreu um erro ao deletar categoria. Verifique se a categoria existe e pode ser deletada.')

    return true
  } catch (error) {
    throw error
  }
}

module.exports = {
  get,
  register,
  update,
  deleteCategory
}
