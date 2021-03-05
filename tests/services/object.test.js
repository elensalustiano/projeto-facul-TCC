const request = require('supertest')
const app = require('../../src/app')
const auth = require('../../src/auth/auth')
const lib = require('../../src/app/lib/object')
const userRepository = require('../../src/app/repositories/user')
const { validationError } = require('../../src/app/lib/error-wrap')
const notificationLib = require('../../src/app/lib/notification')
const emailLib = require('../../src/app/lib/email')

const basePath = '/object'
const object = {
  category: 'mockCategory',
  type: 'mockType',
  foundDate: '2019/05/06',
  fields: [{
    name: 'test',
    value: 'mocked value'
  }]
}

describe('POST /object', () => {
  let token
  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'institution' }
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
    await request(app).post(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send(object)
      .expect(403)
  })

  describe('when some required fields is missing', () => {
    it('returns an error', async () => {
      await request(app).post(basePath)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'test' })
        .expect(400)
    })
  })

  it('register a new object', async () => {
    jest.spyOn(lib, 'register').mockResolvedValue({ _id: 'mock' })
    jest.spyOn(notificationLib, 'checkNotifications').mockResolvedValue()

    await request(app).post(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send(object)
      .expect(200)
      .expect('"Cadastrado com sucesso."')
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'register').mockRejectedValue(new Error('test'))

    await request(app).post(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send(object)
      .expect(500)
  })
})

describe('PATCH /object', () => {
  const payload = {
    _id: 'objectMockId',
    type: 'mock'
  }

  let token
  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'institution' }
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
    await request(app).patch(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(403)
  })

  describe('when update fail', () => {
    it('returns an error', async () => {
      jest.spyOn(lib, 'update').mockRejectedValue(validationError('test'))

      await request(app).patch(basePath)
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(400)
    })
  })

  it('update an object', async () => {
    jest.spyOn(lib, 'update').mockResolvedValue({ ...object, ...payload })

    await request(app).patch(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200)
      .expect({ ...object, ...payload })
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'update').mockRejectedValue(new Error('test'))

    await request(app).patch(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(500)
  })
})

describe('GET /object', () => {
  let token
  beforeEach(async () => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'applicant' }
    )
    token = await auth.encrypt({ id: 'mock' }, '7d')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('return object', async () => {
    jest.spyOn(lib, 'getObject').mockResolvedValue([])

    await request(app).get(basePath)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

  describe('when pass query params', () => {
    it('eturn object', async () => {
      jest.spyOn(lib, 'getObject').mockResolvedValue([])

      await request(app).get(`${basePath}?status=0&devolutionCode=code1`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'getObject').mockRejectedValue(new Error('test'))

    await request(app).get(basePath)
      .set('Authorization', `Bearer ${token}`)
      .expect(500)
  })
})

describe('DELETE /object', () => {
  let token
  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'institution' }
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

    await request(app).delete(`${basePath}/validObjectId`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })

  describe('when delete fail', () => {
    it('returns an error', async () => {
      jest.spyOn(lib, 'deleteObject').mockRejectedValue(validationError('test'))

      await request(app).delete(`${basePath}/validObjectId`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })
  })

  it('delete an object', async () => {
    jest.spyOn(lib, 'deleteObject').mockResolvedValue(true)

    await request(app).delete(`${basePath}/validObjectId`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('"Objeto deletado."')
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'deleteObject').mockRejectedValue(new Error('test'))

    await request(app).delete(`${basePath}/validObjectId`)
      .set('Authorization', `Bearer ${token}`)
      .expect(500)
  })
})

describe('POST /object/search', () => {
  const filter = {
    category: 'mockDoc',
    type: 'mockType',
    foundDate: '2019/05/06',
    fields: [{
      name: 'test',
      value: 'mocked value'
    }]
  }

  it('search an object', async () => {
    jest.spyOn(lib, 'search').mockResolvedValue([])

    await request(app).post(`${basePath}/find`)
      .send(filter)
      .expect(200)
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'search').mockRejectedValue(new Error('test'))

    await request(app).post(`${basePath}/find`)
      .send(filter)
      .expect(500)
  })
})

describe('PATCH /object/find', () => {
  let token
  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'applicant' }
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
      { _id: 'mock', profile: 'institution' }
    )
    await request(app).patch(`${basePath}/find`)
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(403)
  })

  describe('when objectId is not passed', () => {
    it('returns an error', async () => {
      await request(app).patch(`${basePath}/find`)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(400)
    })
  })

  it('register a solicitation', async () => {
    jest.spyOn(lib, 'solicit').mockResolvedValue('code1')
    jest.spyOn(emailLib, 'sendEmail').mockResolvedValue()

    await request(app).patch(`${basePath}/find`)
      .set('Authorization', `Bearer ${token}`)
      .send({ objectId: 'validObjectId' })
      .expect(200)
      .expect('"code1"')
  })

  describe('when lib fails', () => {
    it('returns an error', async () => {
      jest.spyOn(lib, 'solicit').mockRejectedValue(validationError('test'))

      await request(app).patch(`${basePath}/find`)
        .set('Authorization', `Bearer ${token}`)
        .send({ objectId: 'invalidObjectId' })
        .expect(400)
    })
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'solicit').mockRejectedValue(new Error())

    await request(app).patch(`${basePath}/find`)
      .set('Authorization', `Bearer ${token}`)
      .send({ objectId: 'validObjectId' })
      .expect(500)
  })
})

describe('PATCH /object/devolve', () => {
  let token
  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'institution' }
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
    await request(app).patch(`${basePath}/devolve`)
      .set('Authorization', `Bearer ${token}`)
      .send({ devolutionCode: 'code1' })
      .expect(403)
  })

  describe('when devolution code is not passed', () => {
    it('returns an error', async () => {
      await request(app).patch(`${basePath}/devolve`)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(400)
        .expect({
          statusCode: 400,
          name: 'Bad Request',
          message: [ { field: 'devolutionCode', error: '"devolutionCode" is required' } ]
        })
    })
  })

  describe('when lib fails', () => {
    it('returns an error', async () => {
      jest.spyOn(lib, 'devolve').mockRejectedValue(validationError('test'))

      await request(app).patch(`${basePath}/devolve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ devolutionCode: 'code1' })
        .expect(400)
    })
  })

  it('devolve an object', async () => {
    jest.spyOn(lib, 'devolve').mockResolvedValue()

    await request(app).patch(`${basePath}/devolve`)
      .set('Authorization', `Bearer ${token}`)
      .send({ devolutionCode: 'code1' })
      .expect(200)
      .expect('"Objeto devolvido."')
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'devolve').mockRejectedValue(new Error('test'))

    await request(app).patch(`${basePath}/devolve`)
      .set('Authorization', `Bearer ${token}`)
      .send({ devolutionCode: 'code1' })
      .expect(500)
  })
})

describe('PATCH /object/cancel', () => {
  const payload = { devolutionCode: 'mockDevolutionCode' }
  const path = `${basePath}/cancel`
  let token

  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'institution' }
    )
  })

  beforeAll(async () => {
    token = await auth.encrypt({ id: 'mock' }, '7d')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when update fail', () => {
    it('returns an error', async () => {
      jest.spyOn(lib, 'cancelSolicitation').mockRejectedValue(validationError('test'))

      await request(app).patch(path)
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(400)
    })
  })

  it('cancel solicitation', async () => {
    jest.spyOn(lib, 'cancelSolicitation').mockResolvedValue()

    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200)
      .expect('"Solicitação do objeto cancelada."')
  })

  describe('when devolution code is not passed', () => {
    it('returns an error', async () => {
      await request(app).patch(path)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(400)
        .expect({
          statusCode: 400,
          name: 'Bad Request',
          message: [ { field: 'devolutionCode', error: '"devolutionCode" is required' } ]
        })
    })
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'cancelSolicitation').mockRejectedValue(new Error('test'))

    await request(app).patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect({
        statusCode: 500,
        name: 'Internal Server Error',
        message: 'Ocorreu um erro inesperado, tente novamente.'
      })
  })
})

describe('GET /object/interested', () => {
  let token
  beforeEach(async () => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'applicant' }
    )
    token = await auth.encrypt({ id: 'mock' }, '7d')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns object', async () => {
    jest.spyOn(lib, 'getObjectByInterested').mockResolvedValue([])

    await request(app).get(`${basePath}/interested`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

  describe('when pass query params', () => {
    it('returns object filtered by status', async () => {
      jest.spyOn(lib, 'getObjectByInterested').mockResolvedValue([])

      await request(app).get(`${basePath}/interested?status=0`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'getObjectByInterested').mockRejectedValue(new Error('test'))

    await request(app).get(`${basePath}/interested`)
      .set('Authorization', `Bearer ${token}`)
      .expect(500)
  })
})

describe('PATCH /object/interested', () => {
  let token
  const interestedPath = `${basePath}/interested`

  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'applicant' }
    )
  })

  beforeAll(async () => {
    token = await auth.encrypt({ id: 'mock' }, '7d')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when objectId is not passed', () => {
    it('returns an error', async () => {
      await request(app).patch(interestedPath)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(400)
    })
  })

  it('register interested', async () => {
    jest.spyOn(lib, 'registerInterest').mockResolvedValue()

    await request(app).patch(interestedPath)
      .set('Authorization', `Bearer ${token}`)
      .send({ objectId: 'validObjectId' })
      .expect(200)
      .expect('"Adicionado na lista de interessados."')
  })

  describe('when lib fails', () => {
    it('returns an error', async () => {
      jest.spyOn(lib, 'registerInterest').mockRejectedValue(validationError('test'))

      await request(app).patch(interestedPath)
        .set('Authorization', `Bearer ${token}`)
        .send({ objectId: 'invalidObjectId' })
        .expect(400)
    })
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'registerInterest').mockRejectedValue(new Error())

    await request(app).patch(interestedPath)
      .set('Authorization', `Bearer ${token}`)
      .send({ objectId: 'validObjectId' })
      .expect(500)
  })
})

describe('DELETE /object/interested', () => {
  let token
  const interestedPath = `${basePath}/interested/objectId`

  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'applicant' }
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
      { _id: 'mock', profile: 'institution' }
    )

    await request(app).delete(interestedPath)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })

  describe('when delete fail', () => {
    it('returns an error', async () => {
      jest.spyOn(lib, 'deleteInterested').mockRejectedValue(validationError('test'))

      await request(app).delete(interestedPath)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })
  })

  it('delete an interested object', async () => {
    jest.spyOn(lib, 'deleteInterested').mockResolvedValue()

    await request(app).delete(interestedPath)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('"Interesse cancelado."')
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'deleteInterested').mockRejectedValue(new Error('test'))

    await request(app).delete(interestedPath)
      .set('Authorization', `Bearer ${token}`)
      .expect(500)
  })
})
