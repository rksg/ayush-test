import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                                                     from '@acx-ui/feature-toggle'
import { rwgApi }                                                           from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo }                                               from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

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
    apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
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
  venueId: '3f10af1401b44902a88723cb68c4bc77',
  activeTab: 'overview'
}


describe('RWG Dashboard statistics', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(rwgApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonRbacUrlsInfo.getGateway.url,
        (req, res, ctx) => res(ctx.json(gatewayResponse))
      ),
      rest.post(
        CommonRbacUrlsInfo.getGatewayAlarms.url,
        (req, res, ctx) => res(ctx.json({
          total: 720
        }))
      ),
      rest.get(
        CommonRbacUrlsInfo.getGatewayDashboard.url,
        (req, res, ctx) => res(ctx.json(dashboard))
      ),
      rest.get(
        CommonRbacUrlsInfo.getGatewayDetails.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should correctly render statistics', async () => {

    render(<Provider><DashboardStatistics /> </Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Alarms')).toBeInTheDocument()
    expect(await screen.findByText('CPU')).toBeInTheDocument()
    expect(await screen.findByText('Temperature')).toBeInTheDocument()
    expect(await screen.findByText('Storage')).toBeInTheDocument()
    expect(await screen.findByText('Memory Usage')).toBeInTheDocument()

  })

  it('should show more details', async () => {

    render(<Provider><DashboardStatistics /> </Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    await fireEvent.click(await screen.findByRole('button', { name: 'More Details' }))

    expect(await screen.findByText('More Details')).toBeInTheDocument()

    expect(await screen.findByRole('radio', { name: 'General' })).toBeInTheDocument()
    expect(await screen.findByRole('radio', { name: 'Hardware' })).toBeInTheDocument()
    expect(await screen.findByRole('radio', { name: 'Disk & Memory' })).toBeInTheDocument()

  })

})
