
const lib = require('../../src/app/lib/category')
const categoryRepository = require('../../src/app/repositories/category')
const objectRepository = require('../../src/app/repositories/object')

const category = {
  name: 'mockCategory',
  type: ['mockType'],
  fields: [
    {
      name: 'test',
      options: ['mockedOption']
    },
    {
      name: 'otherTest',
      options: ['mockedOption']
    }
  ]
}

describe('Lib/category - #get', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns categories', async () => {
    jest.spyOn(categoryRepository, 'find').mockResolvedValue([])
    expect(await lib.get()).toHaveLength(0)
  })
})

describe('Lib/category - #register', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('register a new category', async () => {
    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue()
    categoryRepository.register = jest.fn()

    await lib.register(category)

    expect(categoryRepository.register).toHaveBeenCalledWith(category)
  })

  describe('when category is registered', () => {
    it('returns an error', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category)
      const errorExpected = {
        message: `Categoria ${category.name} é similar a ${category.name} já cadastrada.`,
        name: 'Bad Request',
        statusCode: 400
      }
      await expect(lib.register(category)).rejects.toEqual(errorExpected)
    })
  })
})

describe('Lib/category - #update', () => {
  const categoryUpdate = {
    _id: 'mock',
    type: ['changeType'],
    fields: [
      {
        name: 'test',
        options: ['changeOption']
      },
      {
        name: 'newField',
        options: ['changeOption']
      }
    ]
  }

  beforeEach(() => {
    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when type field is not passed', () => {
    it('update fields', async () => {
      const { type, ...categoryUpdateWithoutType } = categoryUpdate

      jest.spyOn(categoryRepository, 'addFieldOrType').mockResolvedValue({ nModified: 1 })
      jest.spyOn(categoryRepository, 'updateField').mockResolvedValue()
      jest.spyOn(categoryRepository, 'RemoveField').mockResolvedValue()
      jest.spyOn(objectRepository, 'getFieldCount').mockResolvedValue(0)

      expect(await lib.update(categoryUpdateWithoutType)).toBeTruthy()
    })

    describe('when fields is being used', () => {
      it('update fields', async () => {
        const { type, ...categoryUpdateWithoutType } = categoryUpdate

        jest.spyOn(categoryRepository, 'addFieldOrType').mockResolvedValue({ nModified: 1 })
        jest.spyOn(categoryRepository, 'updateField').mockResolvedValue()
        jest.spyOn(categoryRepository, 'RemoveField').mockResolvedValue()
        jest.spyOn(objectRepository, 'getFieldCount').mockResolvedValue(3)

        expect(await lib.update(categoryUpdateWithoutType)).toBeTruthy()
      })
    })

    it('returns an error', async () => {
      const errorExpected = {
        message: 'Ocorreu um erro ao editar categoria.',
        name: 'Bad Request',
        statusCode: 400
      }
      const { type, ...invalidCategory } = categoryUpdate
      jest.spyOn(categoryRepository, 'RemoveField').mockRejectedValue()
      jest.spyOn(objectRepository, 'getFieldCount').mockResolvedValue(0)

      await expect(lib.update(invalidCategory)).rejects.toEqual(errorExpected)
    })
  })

  describe('when fields field is not passed', () => {
    it('update type', async () => {
      const { fields, ...categoryUpdateWithoutFields } = categoryUpdate

      jest.spyOn(categoryRepository, 'addFieldOrType').mockResolvedValue({ nModified: 1 })
      jest.spyOn(categoryRepository, 'RemoveType').mockResolvedValue()
      jest.spyOn(objectRepository, 'getTypeCount').mockResolvedValue(0)

      expect(await lib.update(categoryUpdateWithoutFields)).toBeTruthy()
    })

    describe('when type is being used', () => {
      it('update fields', async () => {
        const { fields, ...categoryUpdateWithoutFields } = categoryUpdate

        jest.spyOn(categoryRepository, 'addFieldOrType').mockResolvedValue({ nModified: 1 })
        jest.spyOn(objectRepository, 'getTypeCount').mockResolvedValue(2)
        jest.spyOn(categoryRepository, 'RemoveType').mockResolvedValue()

        expect(await lib.update(categoryUpdateWithoutFields)).toBeTruthy()
      })
    })

    it('returns an error', async () => {
      const errorExpected = {
        message: 'Ocorreu um erro ao editar categoria.',
        name: 'Bad Request',
        statusCode: 400
      }
      const { fields, ...invalidCategory } = categoryUpdate
      jest.spyOn(categoryRepository, 'RemoveType').mockRejectedValue()
      jest.spyOn(objectRepository, 'getTypeCount').mockResolvedValue(0)

      await expect(lib.update(invalidCategory)).rejects.toEqual(errorExpected)
    })
  })

  describe('when category is not found', () => {
    it('returns an error', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue()

      const errorExpected = {
        message: 'Categoria não encontrada.',
        name: 'Bad Request',
        statusCode: 400
      }

      await expect(lib.update({ _id: 'notFound' })).rejects.toEqual(errorExpected)
    })
  })

  describe('when category id is invalid', () => {
    it('returns an error', async () => {
      const errorExpected = {
        message: 'Id da categoria inválido.',
        name: 'Bad Request',
        statusCode: 400
      }
      jest.spyOn(categoryRepository, 'findOne').mockRejectedValue({ name: 'CastError' })

      await expect(lib.update({ _id: 'invalidId' })).rejects.toEqual(errorExpected)
    })
  })

  it('returns an error', async () => {
    const errorExpected = {
      message: 'Ocorreu um erro ao editar categoria.',
      name: 'Bad Request',
      statusCode: 400
    }
    const { fields, ...invalidCategory } = categoryUpdate

    jest.spyOn(categoryRepository, 'RemoveType').mockResolvedValue()
    jest.spyOn(objectRepository, 'getTypeCount').mockResolvedValue(0)
    jest.spyOn(categoryRepository, 'addFieldOrType').mockResolvedValue({ nModified: 0 })

    await expect(lib.update(invalidCategory)).rejects.toEqual(errorExpected)
  })
})

describe('Lib/object - #deleteCategory', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('delete category', async () => {
    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue({ name: 'mock' })
    jest.spyOn(objectRepository, 'getCategoryCount').mockResolvedValue(0)
    jest.spyOn(categoryRepository, 'deleteOne').mockResolvedValue({ deletedCount: 1 })
    expect(await lib.deleteCategory('categoryId')).toEqual(true)
  })

  it('returns an error', async () => {
    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue({ name: 'mock' })
    jest.spyOn(objectRepository, 'getCategoryCount').mockResolvedValue(0)
    jest.spyOn(categoryRepository, 'deleteOne').mockResolvedValue({ deletedCount: 0 })

    const errorExpected = {
      message: 'Ocorreu um erro ao deletar categoria. Verifique se a categoria existe e pode ser deletada.',
      name: 'Bad Request',
      statusCode: 400
    }

    await expect(lib.deleteCategory('categoryId')).rejects.toEqual(errorExpected)
  })

  describe('when category id is invalid', () => {
    it('returns an error', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockRejectedValue({ name: 'CastError' })
      const errorExpected = {
        message: 'Id da categoria inválido.',
        name: 'Bad Request',
        statusCode: 400
      }

      await expect(lib.deleteCategory('invalidId')).rejects.toEqual(errorExpected)
    })
  })

  describe('when category is being used', () => {
    it('returns an error', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue({ name: 'mock' })
      jest.spyOn(objectRepository, 'getCategoryCount').mockResolvedValue(2)

      const errorExpected = {
        message: 'Categoria não pode ser deletada, pois está sendo usada.',
        name: 'Bad Request',
        statusCode: 400
      }

      await expect(lib.deleteCategory('institutionId', 'invalidId')).rejects.toEqual(errorExpected)
    })
  })
})
