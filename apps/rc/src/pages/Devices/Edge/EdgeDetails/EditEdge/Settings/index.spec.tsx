
import { render }    from '@acx-ui/test-utils'
import { setUpIntl } from '@acx-ui/utils'

import Settings from './index'

describe('EditEdge settings', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '0000000030'
    }
    setUpIntl({
      locale: 'en-US',
      messages: {}
    })
  })

  it('should create Settings successfully', async () => {
    const { asFragment } = render(
      <Settings />, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit/settings/ports' }
      })
    expect(asFragment()).toMatchSnapshot()
  })
})