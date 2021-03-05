const request = require('supertest')

const app = require('../../src/app')
const lib = require('../../src/app/lib/user')
const userRepository = require('../../src/app/repositories/user')
const { validationError } = require('../../src/app/lib/error-wrap')
const auth = require('../../src/auth/auth')

const applicant = {
  email: `email.applicant@test.com`,
  password: 'test',
  cpf: `05411826098`,
  name: 'test',
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
const path = '/applicant'

describe('POST /applicant', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when some required fields is missing', () => {
    it('returns bad request error', async () => {
      const { password, ...applicantClone } = applicant

      await request(app).post(path)
        .send(applicantClone)
        .expect(400)
        .expect({
          statusCode: 400,
          name: 'Bad Request',
          message: [ { field: 'password', error: '"password" is required' } ]
        })
    })
  })

  it('register an applicant account', async () => {
    jest.spyOn(lib, 'register').mockResolvedValue({ ...applicant })

    const { status, body: { token } } = await request(app).post(path).send(applicant)
    expect(status).toBe(200)
    expect(token).not.toBeUndefined()
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'register').mockRejectedValue(new Error('test'))

    await request(app).post(path)
      .send(applicant)
      .expect(500)
  })
})

describe('PATCH /applicant', () => {
  const applicantUpdate = {
    phone: '123456789',
    name: 'update test',
    password: 'test'
  }
  let token

  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockReturnValue(
      { _id: 'mock', profile: 'applicant', ...applicantUpdate }
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
      .send(applicantUpdate)
      .expect(401)
  })

  it('returns forbidden', async () => {
    jest.spyOn(userRepository, 'findById').mockReturnValue(
      { _id: 'mock', profile: 'institution', ...applicantUpdate }
    )
    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(applicantUpdate)
      .expect(403)
  })

  it('edit an applicant account', async () => {

    const applicantResponse = { ...applicant, ...applicantUpdate }
    jest.spyOn(lib, 'update').mockResolvedValue(applicantResponse)

    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(applicantUpdate)
      .expect(200)
      .expect(applicantResponse)
  })

  it('returns an update error', async () => {
    jest.spyOn(lib, 'update').mockRejectedValue(validationError('test'))

    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(applicantUpdate)
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
      .send(applicantUpdate)
      .expect(500)
  })
})
