const request = require('supertest')

const app = require('../../src/app')
const lib = require('../../src/app/lib/user')
const { unauthorizedError } = require('../../src/app/lib/error-wrap')
const auth = require('../../src/auth/auth')
const emailLib = require('../../src/app/lib/email')

describe('POST /login', () => {
  const path = '/login'
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when some credential is not passed', () => {
    it('returns bad request error', async () => {
      const credential = { id: 'registered@test.com' }

      await request(app).post(path)
        .send(credential)
        .expect(400)
        .expect({
          statusCode: 400,
          name: 'Bad Request',
          message: [ { field: 'password', error: '"password" is required' } ]
        })
    })
  })

  describe('when user is not registered', () => {
    it('returns unauthorized', async () => {
      const credential = {
        id: 'not.registered@test.com',
        password: 'mockPass'
      }

      jest.spyOn(lib, 'login').mockRejectedValue(unauthorizedError('test'))

      await request(app).post(path)
        .send(credential)
        .expect(401)
    })
  })

  it('returns server error', async () => {
    const credential = {
      id: 'registered@test.com',
      password: 'mockPass'
    }

    jest.spyOn(lib, 'login').mockRejectedValue(new Error('test'))

    await request(app).post(path)
      .send(credential)
      .expect(500)
  })

  it('login with success', async () => {
    const user = {
      email: 'registered@test.com',
      password: 'mockPass',
      cnpj: `${Date.now().toString()}7`,
      companyName: 'test',
      fantasyName: 'string',
      phone: 0,
      address: {
        street: 'string',
        number: 0,
        neighborhood: 'string',
        city: 'string',
        state: 'string',
        zipCode: 0
      }
    }

    jest.spyOn(lib, 'login').mockResolvedValue(user)
    const { status, body: { token } } = await request(app).post(path)
      .send({ id: user.email, password: user.password })

    expect(status).toBe(200)
    expect(token).not.toBeUndefined()
  })
})

describe('POST /passwordRecovery', () => {
  const path = '/passwordRecovery'

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when some required field is missing', () => {
    it('returns bad request error', async () => {
      const fields = { id: 'registered@test.com' }

      await request(app).post(path)
        .send(fields)
        .expect(400)
        .expect({
          statusCode: 400,
          name: 'Bad Request',
          message: [ { field: 'url', error: '"url" is required' } ]
        })
    })
  })

  it('password recovery success', async () => {
    const user = {
      email: 'registered@test.com',
      password: 'mockPass',
      cnpj: '12345678912345',
      companyName: 'test',
      fantasyName: 'string',
      phone: 0,
      address: {
        street: 'string',
        number: 0,
        neighborhood: 'string',
        city: 'string',
        state: 'string',
        zipCode: 0
      }
    }

    const fields = {
      id: 'registered@test.com',
      url: 'test.com.br'
    }

    jest.spyOn(lib, 'getUser').mockResolvedValue(user)
    jest.spyOn(emailLib, 'sendEmail').mockResolvedValue()

    await request(app).post(path)
      .send(fields)
      .expect(200)
      .expect('"Email enviado."')
  })

  it('returns server error', async () => {
    const fields = {
      id: 'registered@test.com',
      url: 'test.com.br'
    }

    jest.spyOn(lib, 'getUser').mockRejectedValue(new Error('test'))

    await request(app).post(path)
      .send(fields)
      .expect(500)
  })
})

describe('PATCH /changePassword', () => {
  const path = '/changePassword'
  let token

  beforeAll(async () => {
    token = await auth.encrypt({ token: 'mockId', profile: 'applicant' }, '1h')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when some required field is missing', () => {
    it('returns bad request error', async () => {
      const fields = { token }

      await request(app).patch(path)
        .send(fields)
        .expect(400)
        .expect({
          statusCode: 400,
          name: 'Bad Request',
          message: [ { field: 'password', error: '"password" is required' } ]
        })
    })
  })

  it('change password with success', async () => {
    const fields = {
      token,
      password: 'mockPass'
    }

    jest.spyOn(lib, 'update').mockResolvedValue()
    await request(app).patch(path)
      .send(fields)
      .expect(200)
      .expect('"Senha trocada."')
  })

  it('returns server error', async () => {
    const fields = {
      token,
      password: 'mockPass'
    }

    jest.spyOn(lib, 'update').mockRejectedValue(new Error('test'))

    await request(app).patch(path)
      .send(fields)
      .expect(500)
  })
})
