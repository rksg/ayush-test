import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { rwgApi }                              from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo }                  from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { GatewayOverviewTab } from '.'

const gatewayResponse = {
  requestId: 'request-id',
  response: {
    rwgId: 'bbc41563473348d29a36b76e95c50381',
    venueId: '3f10af1401b44902a88723cb68c4bc77',
    venueName: 'My-Venue',
    name: 'ruckusdemos',
    hsotname: 'https://rxgs5-vpoc.ruckusdemos.net',
    apiKey: 'xxxxxxxxxxxxxxx',
    status: 'Operational'
  }
}


const params = {
  tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
  gatewayId: 'bbc41563473348d29a36b76e95c50381',
  venueId: '3f10af1401b44902a88723cb68c4bc77',
  activeTab: 'overview'
}


describe('RWGDetails GatewayOverview', () => {
  beforeEach(() => {
    store.dispatch(rwgApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        CommonRbacUrlsInfo.getGateway.url,
        (req, res, ctx) => res(ctx.json(gatewayResponse))
      ),
      rest.get(
        CommonRbacUrlsInfo.getGatewayTopProcess.url,
        (req, res, ctx) => res(ctx.json({ response: [] }))
      ),
      rest.get(
        CommonRbacUrlsInfo.getGatewayFileSystems.url,
        (req, res, ctx) => res(ctx.json({ response: [] }))
      ),
      rest.get(
        CommonRbacUrlsInfo.getGatewayDashboard.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonRbacUrlsInfo.getGatewayAlarms.url,
        (req, res, ctx) => res(ctx.json({
          total: 720
        }))
      )
    )

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
