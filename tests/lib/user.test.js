const lib = require('../../src/app/lib/user')
const institutionRepository = require('../../src/app/repositories/institution')
const applicantRepository = require('../../src/app/repositories/applicant')
const userRespository = require('../../src/app/repositories/user')

const user = {
  _id: 'mock',
  email: 'email@test.com',
  password: 'string',
  phone: '0',
  address: {
    street: 'string',
    number: 0,
    neighborhood: 'string',
    city: 'string',
    state: 'string',
    zipCode: '0'
  }
}

describe('Lib/user - #register', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when profile is institution', () => {
    it('register a new user', async () => {
      const institution = {
        ...user,
        profile: 'institution',
        cnpj: '12345678912345',
        companyName: 'test',
        fantasyName: 'string'
      }

      jest.spyOn(institutionRepository, 'register').mockResolvedValue({ ...institution })
      expect(await lib.register(institution)).toEqual({ ...institution, password: undefined })
    })
  })

  describe('when profile is applicant', () => {
    it('register a new user', async () => {
      const applicant = {
        ...user,
        profile: 'applicant',
        cpf: `05411826098`,
        name: 'test'
      }

      jest.spyOn(applicantRepository, 'register').mockResolvedValue({ ...applicant })
      expect(await lib.register(applicant)).toEqual({ ...applicant, password: undefined })
    })
  })

  describe('when user registered', () => {
    it('returns an error', async () => {
      const applicant = {
        ...user,
        profile: 'applicant',
        cpf: `05411826098`,
        name: 'test'
      }
      const errorExpected = {
        message: 'Erro ao registrar usuário. Verifique se o usuário já existe.',
        name: 'Bad Request',
        statusCode: 400
      }

      jest.spyOn(applicantRepository, 'register').mockRejectedValue({ name: 'MongoError' })
      await expect(lib.register(applicant)).rejects.toEqual(errorExpected)
    })
  })

  it('returns an error', async () => {
    const applicant = {
      ...user,
      profile: 'applicant',
      cpf: `05411826098`,
      name: 'test'
    }
    const errorExpected = {
      message: 'Erro ao registrar usuário. Verifique se o usuário já existe.',
      name: 'Bad Request',
      statusCode: 400
    }

    jest.spyOn(applicantRepository, 'register').mockResolvedValue()
    await expect(lib.register(applicant)).rejects.toEqual(errorExpected)
  })
})

describe('Lib/user - #update', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when profile is institution', () => {
    it('update user', async () => {
      const institution = {
        _id: 'mock',
        companyName: 'change',
        profile: 'institution'
      }

      jest.spyOn(institutionRepository, 'update').mockResolvedValue(institution)
      expect(await lib.update(institution)).toEqual(institution)
    })
  })

  describe('when profile is applicant', () => {
    it('update user', async () => {
      const applicant = {
        _id: 'mock',
        name: 'change',
        profile: 'applicant'
      }

      jest.spyOn(applicantRepository, 'update').mockResolvedValue(applicant)
      expect(await lib.update(applicant)).toEqual(applicant)
    })
  })

  it('returns an error', async () => {
    const applicant = {
      ...user,
      profile: 'applicant'
    }
    const errorExpected = {
      message: 'Ocorreu um erro ao editar dados.',
      name: 'Bad Request',
      statusCode: 400
    }

    jest.spyOn(applicantRepository, 'update').mockResolvedValue()
    await expect(lib.update(applicant)).rejects.toEqual(errorExpected)
  })
})

describe('Lib/user - #getInstitutions', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns instituions', async () => {
    jest.spyOn(institutionRepository, 'find').mockResolvedValue([])
    expect(await lib.getInstitutions()).toHaveLength(0)
  })
})

describe('Lib/user - #getUser', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns user', async () => {
    jest.spyOn(userRespository, 'findOne').mockResolvedValue(user)
    expect(await lib.getUser(user._id)).toEqual(user)
  })
  it('returns an error', async () => {
    jest.spyOn(userRespository, 'findOne').mockResolvedValue()
    const errorExpected = {
      message: 'Usuário não encontrado.',
      name: 'Unauthorized',
      statusCode: 401
    }
    await expect(lib.getUser(user._id)).rejects.toEqual(errorExpected)
  })
})

describe('Lib/user - #getUserById', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns user', async () => {
    jest.spyOn(userRespository, 'findById').mockResolvedValue(user)
    expect(await lib.getUserById(user._id)).toEqual(user)
  })
  it('returns an error', async () => {
    jest.spyOn(userRespository, 'findById').mockResolvedValue()
    const errorExpected = {
      message: 'Usuário não encontrado.',
      name: 'Unauthorized',
      statusCode: 401
    }
    await expect(lib.getUserById(user._id)).rejects.toEqual(errorExpected)
  })
})

describe('Lib/user - #login', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('login with success', async () => {
    const passHash = '$2b$08$VkD.6NTbmzXk8wLWGvLzyO.Ua3Hip9u8bXGwapl0IFuIj.ccFrbyy'
    const { password, ...userExpect } = user
    jest.spyOn(userRespository, 'findOne').mockResolvedValue({ ...user, password: passHash })
    expect(await lib.login(user._id, password)).toEqual(userExpect)
  })

  describe('when password is invalid', () => {
    it('returns an error', async () => {
      const errorExpected = {
        message: 'Usuário não encontrado.',
        name: 'Unauthorized',
        statusCode: 401
      }

      jest.spyOn(userRespository, 'findOne').mockResolvedValue(user)
      await expect(lib.login(user._id, user.password)).rejects.toEqual(errorExpected)
    })
  })
})
