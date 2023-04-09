import { rest } from 'msw'

import { EdgeDhcpUrls }               from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockEdgeDhcpData }      from '../../../../../Services/DHCP/Edge/__tests__/fixtures'
import { mockEdgeDhcpHostStats } from '../../../__tests__/fixtures'

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

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpHostStats.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpHostStats))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpByEdgeId.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpData))
      )
    )
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
    const row = await screen.findAllByRole('row', { name: /TestHost/i })
    expect(row.length).toBe(2)
  })
})