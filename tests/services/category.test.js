const request = require('supertest')

const app = require('../../src/app')
const lib = require('../../src/app/lib/category')
const auth = require('../../src/auth/auth')
const userRepository = require('../../src/app/repositories/user')
const { validationError } = require('../../src/app/lib/error-wrap')

const path = '/category'
const category = {
  name: 'mockCategory',
  type: ['mockType'],
  fields: [{
    name: 'test',
    options: ['mockedOption']
  }]
}

const mockFindUser = isAdmin => jest.spyOn(userRepository, 'findById').mockResolvedValue({ _id: 'mock', isAdmin })

describe('GET /category', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns all categories', async () => {
    jest.spyOn(lib, 'get').mockResolvedValue([])

    await request(app).get(path)
      .expect(200)
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'get').mockRejectedValue(new Error('test'))

    await request(app).get(path)
      .expect(500)
  })
})

describe('POST /category', () => {
  let token
  beforeEach(() => {
    mockFindUser(true)
  })

  beforeAll(async () => {
    token = await auth.encrypt({ id: 'mock' }, '7d')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns forbidden', async () => {
    mockFindUser(false)

    await request(app).post(path)
      .set('Authorization', `Bearer ${token}`)
      .send(category)
      .expect(403)
  })

  describe('when some required fields is missing', () => {
    it('returns an error', async () => {
      const { name, ...newCategory } = category
      await request(app).post(path)
        .set('Authorization', `Bearer ${token}`)
        .send(newCategory)
        .expect(400)
        .expect({
          statusCode: 400,
          name: 'Bad Request',
          message: [ { field: 'name', error: '"name" is required' } ]
        })
    })
  })

  it('register a new category', async () => {
    jest.spyOn(lib, 'register').mockResolvedValue()

    await request(app).post(path)
      .set('Authorization', `Bearer ${token}`)
      .send(category)
      .expect(200)
      .expect('"Cadastrada com sucesso."')
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'register').mockRejectedValue(new Error('test'))

    await request(app).post(path)
      .set('Authorization', `Bearer ${token}`)
      .send(category)
      .expect(500)
  })
})

describe('PATCH /category', () => {
  const payload = {
    _id: 'objectMockId',
    type: ['mockTUpdate']
  }
  let token

  beforeEach(() => {
    mockFindUser(true)
  })

  beforeAll(async () => {
    token = await auth.encrypt({ id: 'mock' }, '7d')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns forbidden', async () => {
    mockFindUser(false)
    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(403)
  })

  describe('when category id is missing', () => {
    it('returns a validation error', async () => {
      await request(app).patch(path)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: ['mockName'] })
        .expect(400)
        .expect({
          statusCode: 400,
          name: 'Bad Request',
          message: [{ field: '_id', error: '"_id" is required' }]
        })
    })
  })

  describe('when update fail', () => {
    it('returns an error', async () => {
      jest.spyOn(lib, 'update').mockRejectedValue(validationError('test'))

      await request(app).patch(path)
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(400)
    })
  })

  it('update a category', async () => {
    jest.spyOn(lib, 'update').mockResolvedValue(true)

    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200)
      .expect('"Editado com sucesso."')
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'update').mockRejectedValue(new Error('test'))

    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(500)
  })
})

describe('DELETE /category', () => {
  const id = 'mockId'
  let token

  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', isAdmin: true }
    )
  })

  beforeAll(async () => {
    token = await auth.encrypt({ id: 'mock' }, '7d')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns forbidden', async () => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'applicant' }
    )

    await request(app).delete(`${path}/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })

  describe('when delete fail', () => {
    it('returns an error', async () => {
      jest.spyOn(lib, 'deleteCategory').mockRejectedValue(validationError('test'))

      await request(app).delete(`${path}/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })
  })

  it('delete a category', async () => {
    jest.spyOn(lib, 'deleteCategory').mockResolvedValue(true)

    await request(app).delete(`${path}/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('"Categoria deletada."')
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'deleteCategory').mockRejectedValue(new Error('test'))

    await request(app).delete(`${path}/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(500)
  })
})
