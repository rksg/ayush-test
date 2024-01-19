import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { venueApi }                            from '@acx-ui/rc/services'
import { CommonUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { GatewayOverviewTab } from '.'

const gatewayResponse = {
  requestId: 'request-id',
  response: {
    rwgId: 'bbc41563473348d29a36b76e95c50381',
    tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
    venueId: '3f10af1401b44902a88723cb68c4bc77',
    venueName: 'My-Venue',
    name: 'ruckusdemos',
    loginUrl: 'https://rxgs5-vpoc.ruckusdemos.net',
    username: 'inigo',
    password: 'Inigo123!',
    status: 'Operational',
    id: 'bbc41563473348d29a36b76e95c50381',
    new: false
  }
}


const params = {
  tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
  gatewayId: 'bbc41563473348d29a36b76e95c50381',
  activeTab: 'overview'
}


describe('RWGDetails GatewayOverview', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getGateway.url,
        (req, res, ctx) => res(ctx.json(gatewayResponse))
      ),
      rest.get(
        CommonUrlsInfo.getGatewayTopProcess.url,
        (req, res, ctx) => res(ctx.json({ response: [] }))
      ),
      rest.get(
        CommonUrlsInfo.getGatewayFileSystems.url,
        (req, res, ctx) => res(ctx.json({ response: [] }))
      ),
      rest.get(
        CommonUrlsInfo.getGatewayDashboard.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        CommonUrlsInfo.getGatewayAlarms.url,
        (req, res, ctx) => res(ctx.json({
          total: 720
        }))
      )
    )

    store.dispatch(venueApi.util.resetApiState())
  })

  it('should render overview tab correctly', async () => {

    const { asFragment } = render(<Provider><GatewayOverviewTab /></Provider>, {
      route: { params }
    })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    })
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()

  })

})
