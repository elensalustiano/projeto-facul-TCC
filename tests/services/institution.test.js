/* eslint-disable no-undef */
const request = require('supertest')

const app = require('../../src/app')
const lib = require('../../src/app/lib/user')
const userRepository = require('../../src/app/repositories/user')
const { validationError } = require('../../src/app/lib/error-wrap')
const auth = require('../../src/auth/auth')

const institution = {
  email: `email.institution@test.com`,
  password: 'test',
  cnpj: '12345678912345',
  companyName: 'test',
  fantasyName: 'test',
  phone: '0',
  address: {
    street: 'test',
    number: 0,
    neighborhood: 'test',
    city: 'test',
    state: 'test',
    zipCode: '0'
  }
}
const path = '/institution'

describe('POST /institution', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when some required fields is missing', () => {
    it('returns bad request error', async () => {
      const { password, ...institutionClone } = institution
      await request(app).post(path)
        .send(institutionClone)
        .expect(400)
        .expect({
          statusCode: 400,
          name: 'Bad Request',
          message: [ { field: 'password', error: '"password" is required' } ]
        })
    })
  })

  it('register an institution account', async () => {
    jest.spyOn(lib, 'register').mockResolvedValue(institution)
    const { status, body: { token } } = await request(app).post(path).send(institution)

    expect(token).not.toBeUndefined()
    expect(status).toBe(200)
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'register').mockRejectedValue(new Error('test'))

    await request(app).post(path).send(institution)
      .expect(500)
  })
})

describe('GET /institution', () => {
  it('list all institution', async () => {
    jest.spyOn(lib, 'getInstitutions').mockResolvedValue([])
    await request(app).get(path)
      .expect(200)
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'getInstitutions').mockRejectedValue(new Error('test'))
    await request(app).get(path)
      .expect(500)
  })
})

describe('PATCH /institution', () => {
  const institutionUpdate = {
    phone: '123456789',
    fantasyName: 'update test',
    password: 'test'
  }
  let token

  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'institution', ...institutionUpdate }
    )
  })

  beforeAll(async () => {
    token = await auth.encrypt({ id: 'mock' }, '7d')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns unauthorized', async () => {
    await request(app).patch(path)
      .set('Authorization', 'Beare invalid')
      .send(institutionUpdate)
      .expect(401)
  })

  it('returns forbidden', async () => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'applicant', ...institutionUpdate }
    )
    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(institutionUpdate)
      .expect(403)
  })

  it('edit an institution account', async () => {
    const institutionResponse = { ...institution, ...institutionUpdate }

    jest.spyOn(lib, 'update').mockResolvedValue(institutionResponse)

    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(institutionUpdate)
      .expect(200)
      .expect(institutionResponse)
  })

  it('returns an update error', async () => {
    jest.spyOn(lib, 'update').mockRejectedValue(validationError('test'))

    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(institutionUpdate)
      .expect(400)
      .expect({
        statusCode: 400,
        name: 'Bad Request',
        message: 'test'
      })
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'update').mockRejectedValue(new Error('test'))

    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(institutionUpdate)
      .expect(500)
  })
})
