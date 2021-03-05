const request = require('supertest')

const app = require('../../src/app')
const lib = require('../../src/app/lib/notification')
const auth = require('../../src/auth/auth')
const userRepository = require('../../src/app/repositories/user')

const path = '/notification'
const notification = {
  category: 'test',
  type: 'test',
  foundDate: '2019-05-25',
  fields: [
    {
      name: 'fieldMock1',
      value: 'test1'
    },
    {
      name: 'fieldMock2',
      value: 'test2'
    }
  ]
}

describe('GET /notification', () => {
  let token

  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'institution' }
    )
  })

  beforeAll(async () => {
    token = await auth.encrypt({ id: 'mock', email: 'mockEmail' }, '7d')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns notification', async () => {
    jest.spyOn(lib, 'get').mockResolvedValue([notification])

    await request(app).get(path)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect([notification])
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'get').mockRejectedValue(new Error('test'))

    await request(app).get(path)
      .set('Authorization', `Bearer ${token}`)
      .expect(500)
  })
})

describe('POST /notification', () => {
  let token

  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'institution' }
    )
  })

  beforeAll(async () => {
    token = await auth.encrypt({ id: 'mock', email: 'mockEmail' }, '7d')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when some required fields is missing', () => {
    it('returns an error', async () => {
      const { type, ...newNotification } = notification

      await request(app).post(path)
        .set('Authorization', `Bearer ${token}`)
        .send(newNotification)
        .expect(400)
        .expect({
          statusCode: 400,
          name: 'Bad Request',
          message: [ { field: 'type', error: '"type" is required' } ]
        })
    })
  })

  it('register a new notification', async () => {
    jest.spyOn(lib, 'register').mockResolvedValue()

    await request(app).post(path)
      .set('Authorization', `Bearer ${token}`)
      .send(notification)
      .expect(200)
      .expect('"Notificação salva."')
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'register').mockRejectedValue(new Error('test'))

    await request(app).post(path)
      .set('Authorization', `Bearer ${token}`)
      .send(notification)
      .expect(500)
  })
})

describe('DELETE /notification', () => {
  const notificationMockId = 'mock'
  let token

  beforeEach(() => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(
      { _id: 'mock', profile: 'institution' }
    )
  })

  beforeAll(async () => {
    token = await auth.encrypt({ id: 'mock', email: 'mockEmail' }, '7d')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('delete notification', async () => {
    jest.spyOn(lib, 'deleteNotification').mockResolvedValue()

    await request(app).delete(`${path}/${notificationMockId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('"Notificação deletada."')
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'deleteNotification').mockRejectedValue(new Error('test'))

    await request(app).delete(`${path}/${notificationMockId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(500)
  })
})
