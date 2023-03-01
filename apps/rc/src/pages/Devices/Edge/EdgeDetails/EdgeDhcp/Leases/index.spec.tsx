import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import Pools from '.'

describe('Edge DHCP - Leases tab', () => {

  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'dhcp',
      activeSubTab: 'leases'
    }
  })

  it('Should render Leases tab successfully', async () => {
    render(
      <Provider>
        <Pools />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edge-details/:activeTab/:activeSubTab'
        }
      })
    const row = await screen.findAllByRole('row', { name: /Host/i })
    expect(row.length).toBe(1)
  })
})