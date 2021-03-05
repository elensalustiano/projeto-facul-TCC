const request = require('supertest')

const app = require('../../src/app')
const lib = require('../../src/app/lib/coupon')

const path = '/coupon'
const coupon = {
  title: 'mockTitle',
  code: 'mockTitle',
  companyName: 'mockCompanyName',
  description: 'mockDescription',
  logo: 'mockLogo',
  category: 'mockCategory'
}

describe('GET /coupon', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns all coupon', async () => {
    jest.spyOn(lib, 'get').mockResolvedValue([])

    await request(app).get(path)
      .expect(200)
      .expect([])
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'get').mockRejectedValue(new Error('test'))

    await request(app).get(path)
      .expect(500)
  })
})

describe('POST /coupon', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when some required fields is missing', () => {
    it('returns an error', async () => {
      const { code, ...newCoupon } = coupon

      await request(app).post(path)
        .send(newCoupon)
        .expect(400)
        .expect({
          statusCode: 400,
          name: 'Bad Request',
          message: [ { field: 'code', error: '"code" is required' } ]
        })
    })
  })

  it('register a new coupon', async () => {
    jest.spyOn(lib, 'register').mockResolvedValue()

    await request(app).post(path)
      .send(coupon)
      .expect(200)
      .expect('"Cadastrado com sucesso."')
  })

  it('returns server error', async () => {
    jest.spyOn(lib, 'register').mockRejectedValue(new Error('test'))

    await request(app).post(path)
      .send(coupon)
      .expect(500)
  })
})
