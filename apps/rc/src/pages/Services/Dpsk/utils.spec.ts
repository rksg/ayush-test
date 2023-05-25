import { setUpIntl } from '@acx-ui/utils'

import { displayDefaultAccess } from './utils'

describe('DPSK utils', () => {
  beforeEach(() => {
    setUpIntl({
      locale: 'en-US',
      messages: {}
    })
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
