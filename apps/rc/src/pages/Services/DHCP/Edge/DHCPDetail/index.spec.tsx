import { rest } from 'msw'

import { useIsSplitOn }                                                                                                                       from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, EdgeDhcpUrls, EdgeGeneralFixtures, EdgeUrlsInfo, getServiceRoutePath, ServiceOperation, ServiceType, VenueFixtures } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                           from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved }                                                                              from '@acx-ui/test-utils'

import { mockDhcpStatsData, mockDhcpUeSummaryStatsData } from '../__tests__/fixtures'

import EdgeDHCPDetail from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockVenueOptions } = VenueFixtures

describe('EdgeDhcpDetail', () => {
  let params: { tenantId: string, serviceId: string }
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({
    type: ServiceType.EDGE_DHCP,
    oper: ServiceOperation.DETAIL
  })
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: '1'
    }

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpUeSummaryStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpUeSummaryStatsData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueOptions))
      )
    )
  })

  it('Should render EdgeDhcpDetail successfully', async () => {
    render(
      <Provider>
        <EdgeDHCPDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    expect(await screen.findByText('TestDHCP-1')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EdgeDHCPDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'DHCP for RUCKUS Edge'
    })).toBeVisible()
  })

  it('edge cluster name in table should be correct', async () => {
    render(
      <Provider>
        <EdgeDHCPDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row', { name: /Edge Cluster/i })
    expect(rows.length).toBe(2)
  })

  it('venue name in table should be correct', async () => {
    render(
      <Provider>
        <EdgeDHCPDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row', { name: /Mock Venue/i })
    expect(rows.length).toBe(2)
  })

  // it('restart service', async () => {
  //   const user = userEvent.setup()
  //   render(
  //     <Provider>
  //       <EdgeDHCPDetail />
  //     </Provider>, {
  //       route: { params, path: detailPath }
  //     })
  //   const row = await screen.findAllByRole('row', { name: /Edge-/i })
  //   await user.click(within(row[0]).getByRole('checkbox'))
  //   await user.click(within(row[1]).getByRole('checkbox'))
  //   await user.click(await screen.findByRole('button', { name: 'Restart' }))
  // })
})
