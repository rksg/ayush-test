import { rest } from 'msw'

import { useIsSplitOn }                                                     from '@acx-ui/feature-toggle'
import { EdgeDhcpUrls, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen }                                       from '@acx-ui/test-utils'

import { mockDhcpStatsData, mockDhcpUeSummaryStatsData } from '../__tests__/fixtures'

import EdgeDHCPDetail from '.'


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
      name: 'DHCP for SmartEdge'
    })).toBeVisible()
  })

  it('edge detail page link should be correct', async () => {
    render(
      <Provider>
        <EdgeDHCPDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })

    const edgeDetailLink = await screen.findByRole('link',
      { name: 'Edge-dhcp-1' }) as HTMLAnchorElement

    expect(edgeDetailLink.href)
      .toContain(`${params.tenantId}/t/devices/edge/1/details/overview`)
  })

  it('venue detail page link should be correct', async () => {
    render(
      <Provider>
        <EdgeDHCPDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    const venueDetailLinks = await screen.findAllByRole('link',
      { name: 'Edge-venue-1' }) as HTMLAnchorElement[]
    expect(venueDetailLinks[0].href)
      .toContain(`/${params.tenantId}/t/venues/1/venue-details/overview`)
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
