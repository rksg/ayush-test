import { setUpIntl } from '@acx-ui/utils'

import { displayDeviceCountLimit, displayDefaultAccess } from './utils'

describe('DPSK utils', () => {
  beforeEach(() => {
    setUpIntl({
      locale: 'en-US',
      messages: {}
    })
  })

  it('display device count limit', () => {
    const numberResult = displayDeviceCountLimit(1)
    expect(numberResult).toBe(1)

    const unlimitedResult = displayDeviceCountLimit(undefined)
    expect(unlimitedResult).toBe('Unlimited')
  })

  it('display default access', () => {
    const acceptResult = displayDefaultAccess(true)
    expect(acceptResult).toBe('ACCEPT')

    const rejectResult = displayDefaultAccess(false)
    expect(rejectResult).toBe('REJECT')

    const undefinedResult = displayDefaultAccess(undefined)
    expect(undefinedResult).toBe('ACCEPT')
  })
})
