import { rest } from 'msw'

import { EdgeDhcpUrls, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen }                                       from '@acx-ui/test-utils'

import { mockDhcpStatsData } from '../__tests__/fixtures'

import EdgeDHCPDetail from '.'


describe('EdgeDhcpDetail', () => {
  let params: { tenantId: string, serviceId: string }
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({
    type: ServiceType.EDGE_DHCP,
    oper: ServiceOperation.DETAIL
  })
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: '1'
    }

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      )
    )
  })

  it('Should render EdgeDhcpDetail successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeDHCPDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await screen.findByText('TestDHCP-1')
    expect(asFragment()).toMatchSnapshot()
  })

  // it('edge detail page link should be correct', async () => {
  //   render(
  //     <Provider>
  //       <EdgeDHCPDetail />
  //     </Provider>, {
  //       route: { params, path: detailPath }
  //     })
  //   const edgeDetailLink = await screen.findByRole('link',
  //     { name: 'Edge-1' }) as HTMLAnchorElement
  //   expect(edgeDetailLink.href)
  //     .toContain(`/t/${params.tenantId}/devices/edge/1/edge-details/overview`)
  // })

  // it('venue detail page link should be correct', async () => {
  //   render(
  //     <Provider>
  //       <EdgeDHCPDetail />
  //     </Provider>, {
  //       route: { params, path: detailPath }
  //     })
  //   const venueDetailLinks = await screen.findAllByRole('link',
  //     { name: 'Venue A' }) as HTMLAnchorElement[]
  //   expect(venueDetailLinks[0].href)
  //     .toContain(`/t/${params.tenantId}/venues/1/venue-details/overview`)
  // })

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