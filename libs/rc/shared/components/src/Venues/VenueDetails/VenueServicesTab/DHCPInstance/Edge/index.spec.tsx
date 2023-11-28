import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeDhcpUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockedDhcpStatsData, mockedEdgeDhcpData, mockedEdgeList, mockEdgeDhcpHostStats } from './__tests__/fixtures'

import EdgeDhcpTab from '.'

jest.mock('@acx-ui/rc/components', () => ({
  EdgeDhcpLeaseTable: () => <div data-testid='edge-dhcp-lease-table' />,
  EdgeDhcpPoolTable: () => <div data-testid='edge-dhcp-pool-table' />
}))
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  SummaryCard: () => <div data-testid='summary-card' />
}))

const detailPath = '/:tenantId/venues/:venueId/venue-details/:activeTab'

describe('Venue Edge Dhcp Instance', () => {
  let params: { tenantId: string, venueId: string, activeTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      venueId: '37f4bba57a3746e0bc651a1e70a02f55',
      activeTab: 'services'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeList))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (req, res, ctx) => res(ctx.json(mockedDhcpStatsData))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpByEdgeId.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeDhcpData))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpHostStats.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpHostStats))
      )
    )
  })
  it('should render Edge Dhcp Instance correctly', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDhcpTab />
      </Provider>, {
        route: { params, path: detailPath }
      })
    expect(await screen.findByTestId('summary-card')).toBeVisible()
    expect(await screen.findByTestId('edge-dhcp-pool-table')).toBeVisible()
    await user.click(await screen.findByRole('radio', { name: /Leases \(/i }))
    expect(await screen.findByTestId('edge-dhcp-lease-table')).toBeVisible()
  })

})