
const lib = require('../../src/app/lib/notification')
const notificationRepository = require('../../src/app/repositories/notification')
const emailLib = require('../../src/app/lib/email')

const libName = 'Lib/notification'

const notification = {
  _id: 'mock',
  email: 'email.requerent@test.com',
  objectToFind: {
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
}

const object = {
  _id: 'mock',
  category: 'mockCategory',
  type: 'mockType',
  foundDate: '2019/05/06',
  fields: [{
    name: 'test',
    value: 'mocked value'
  }]
}

describe(`${libName} - #get`, () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns notifications', async () => {
    jest.spyOn(notificationRepository, 'find').mockResolvedValue([notification])

    expect(await lib.get('mockEmail')).toHaveLength(1)
  })
})

describe(`${libName} - #register`, () => {
  const mockToSave = {
    _id: 'mock',
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

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('register a new notification', async () => {
    notificationRepository.register = jest.fn()

    lib.register(mockToSave)

    expect(notificationRepository.register).toHaveBeenCalledWith(mockToSave)
  })
})

describe(`${libName} - #checkNotifications`, () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when object alike is not found', () => {
    it('do not save object in notification', async () => {
      jest.spyOn(notificationRepository, 'findByObject').mockResolvedValue([])
      notificationRepository.addObjectFound = jest.fn()
      await lib.checkNotifications(object)

      expect(notificationRepository.addObjectFound).not.toHaveBeenCalled()
    })
  })

  it('save object in notification', async () => {
    jest.spyOn(notificationRepository, 'findByObject').mockResolvedValue([notification])
    jest.spyOn(notificationRepository, 'addObjectFound').mockResolvedValue()
    jest.spyOn(emailLib, 'sendEmail').mockResolvedValue()

    notificationRepository.addObjectFound = jest.fn()
    await lib.checkNotifications(object)

    expect(notificationRepository.addObjectFound).toHaveBeenCalledWith(notification._id, object._id)
  })
})

describe(`${libName} - #deleteNotification`, () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('delete notification', async () => {
    jest.spyOn(notificationRepository, 'deleteOne').mockResolvedValue({ deletedCount: 1 })

    expect(await lib.deleteNotification(notification._id)).toBeTruthy()
  })

  it('returns an error', async () => {
    jest.spyOn(notificationRepository, 'deleteOne').mockResolvedValue({ deletedCount: 0 })

    const errorExpected = {
      message: 'Ocorreu um erro ao deletar notificação.',
      name: 'Bad Request',
      statusCode: 400
    }

    await expect(lib.deleteNotification(notification._id)).rejects.toEqual(errorExpected)
  })

  describe('when id is invalid', () => {
    it('returns an error', async () => {
      jest.spyOn(notificationRepository, 'deleteOne').mockRejectedValue({ name: 'CastError' })
      const errorExpected = {
        message: 'Id inválido.',
        name: 'Bad Request',
        statusCode: 400
      }

      await expect(lib.deleteNotification(notification._id)).rejects.toEqual(errorExpected)
    })
  })
})
