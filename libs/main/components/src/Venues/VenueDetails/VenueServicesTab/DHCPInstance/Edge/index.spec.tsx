import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeDhcpApi, edgeApi } from '@acx-ui/rc/services'
import {
  EdgeDHCPFixtures,
  EdgeDhcpUrls,
  EdgeGeneralFixtures,
  EdgeUrlsInfo,
  getServiceDetailsLink,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Provider, store }                                               from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import EdgeDhcpTab from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockDhcpStatsData, mockEdgeDhcpHostStats } = EdgeDHCPFixtures

const detailPath = '/:tenantId/venues/:venueId/venue-details/:activeTab'

describe('Venue Edge Dhcp Instance', () => {
  let params: { tenantId: string, venueId: string, activeTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      venueId: '37f4bba57a3746e0bc651a1e70a02f55',
      activeTab: 'services'
    }

    store.dispatch(edgeDhcpApi.util.resetApiState())
    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpHostStats.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpHostStats))
      )
    )
  })

  it('should render Edge Dhcp Instance correctly', async () => {
    render(
      <Provider>
        <EdgeDhcpTab />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByRole('row', { name: 'TestDhcp-1 3 1 Good' })).toBeVisible()
    expect(screen.getByRole('row', { name: 'TestDhcp-2 3 1 Good' })).toBeVisible()
    expect(screen.getByRole('row', { name: 'TestDhcp-3 3 1 Good' })).toBeVisible()
    expect(await screen.findByText('Lease Table (2 Online)')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'TestHost1 22.22.22.3 TestDhcp-1 pool1 00:0c:29:26:dd:24 Online 1 Day 00:00:00' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'TestHost2 22.22.22.1 TestDhcp-1 pool2 00:0c:29:26:dd:20 Offline 1 Day 00:00:00' })).toBeVisible()
  })

  it('Check the DHCP link is correct', async () => {
    render(
      <Provider>
        <EdgeDhcpTab />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const dhcpLink = await screen.findByRole('link', { name: 'TestDhcp-1' }) as HTMLAnchorElement
    expect(dhcpLink.href).toBe(`http://localhost/${params.tenantId}/t/${getServiceDetailsLink({
      type: ServiceType.EDGE_DHCP,
      oper: ServiceOperation.DETAIL,
      serviceId: '1'
    })}`)
  })

  it('Check the cluster number tooltip is correct', async () => {
    render(
      <Provider>
        <EdgeDhcpTab />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: 'TestDhcp-1 3 1 Good' })
    const clusterNum = within(row).getByText('1')
    await userEvent.hover(clusterNum)
    expect(await screen.findByText('Edge Cluster 1')).toBeInTheDocument()
  })
})
