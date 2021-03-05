
const lib = require('../../src/app/lib/coupon')
const couponRepository = require('../../src/app/repositories/coupon')

const libName = 'Lib/coupon'

const coupon = {
  title: 'mockTitle',
  code: 'mockTitle',
  companyName: 'mockCompanyName',
  description: 'mockDescription',
  logo: 'mockLogo',
  category: 'mockCategory'
}

describe(`${libName} - #get`, () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns coupons', async () => {
    jest.spyOn(couponRepository, 'find').mockResolvedValue([coupon])

    expect(await lib.get({})).toHaveLength(1)
  })

  it('returns coupons filtered by category', async () => {
    jest.spyOn(couponRepository, 'find').mockResolvedValue([coupon])

    expect(await lib.get({ category: 'categoryMock' })).toHaveLength(1)
  })

  it('returns coupons filtered by type', async () => {
    jest.spyOn(couponRepository, 'find').mockResolvedValue([coupon])

    expect(await lib.get({ type: 'typeMock' })).toHaveLength(1)
  })
})

describe(`${libName} - #register`, () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('register a new coupon', async () => {
    couponRepository.register = jest.fn()

    lib.register(coupon)

    expect(couponRepository.register).toHaveBeenCalledWith(coupon)
  })
})
