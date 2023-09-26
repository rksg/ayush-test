import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { venueApi }                            from '@acx-ui/rc/services'
import { CommonUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { DashboardStatistics } from '.'

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

const dashboard = {
  cpuPercentage: {
    max: 100.0,
    value: 4.125,
    min: 0.0
  },
  memoryInMb: {
    max: 65536,
    value: 12327,
    min: 0
  },
  temperatureInCelsius: {
    max: 80,
    value: 42.56,
    min: 20
  },
  storageInGb: {
    max: 1286.0,
    value: 17.14,
    min: 0.0
  }
}


const params = {
  tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
  gatewayId: 'bbc41563473348d29a36b76e95c50381',
  activeTab: 'overview'
}


describe('RWG Dashboard statistics', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getGateway.url,
        (req, res, ctx) => res(ctx.json(gatewayResponse))
      ),
      rest.get(
        CommonUrlsInfo.getGatewayAlarms.url,
        (req, res, ctx) => res(ctx.json({
          total: 720
        }))
      ),
      rest.get(
        CommonUrlsInfo.getGatewayDashboard.url,
        (req, res, ctx) => res(ctx.json(dashboard))
      )
    )

    store.dispatch(venueApi.util.resetApiState())
  })

  it('should correctly render statistics', async () => {

    render(<Provider><DashboardStatistics /> </Provider>, {
      route: { params }
    })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    })

    expect(await screen.findByText('Alarms')).toBeInTheDocument()
    expect(await screen.findByText('CPU')).toBeInTheDocument()
    expect(await screen.findByText('Temperature')).toBeInTheDocument()
    expect(await screen.findByText('Storage')).toBeInTheDocument()
    expect(await screen.findByText('Memory Usage')).toBeInTheDocument()

  })

})
