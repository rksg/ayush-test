import { displayDeviceCountLimit } from './dpskUtils'

describe('DPSK utils', () => {
  it('display device count limit', () => {
    const numberResult = displayDeviceCountLimit(1)
    expect(numberResult).toBe(1)

    const unlimitedResult = displayDeviceCountLimit(undefined)
    expect(unlimitedResult).toBe('Unlimited')
  })
})
