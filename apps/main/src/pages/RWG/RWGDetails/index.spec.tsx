import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { venueApi }                              from '@acx-ui/rc/services'
import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'


import { RWGDetails } from '.'

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

const gatewayResponse1 = {
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
    status: 'Offline',
    id: 'bbc41563473348d29a36b76e95c50381',
    new: false
  }
}

jest.mock('./GatewayOverviewTab', () => ({
  GatewayOverviewTab: () => <div
    data-testid={'rc-GatewayOverviewTab'}
    title='GatewayOverviewTab' />
}))
jest.mock('./DNSRecordsTab', () => ({
  DNSRecordsTab: () => <div data-testid={'rc-DNSRecordsTab'} title='DNSRecordsTab' />
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))


describe('RWGDetails', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    store.dispatch(venueApi.util.resetApiState())
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
      gatewayId: 'bbc41563473348d29a36b76e95c50381',
      activeTab: 'overview'
    }
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getGateway.url,
        (req, res, ctx) => res(ctx.json(gatewayResponse))
      )
    )
    render(<Provider><RWGDetails /></Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/ruckus-wan-gateway/:gatewayId/gateway-details/:activeTab' }
    })
    expect(await screen.findByText('ruckusdemos')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(2)

    await fireEvent.click(await screen.findByRole('button', { name: 'Configure' }))

    await expect(mockNavigate).toBeCalledTimes(1)

  })

  it('test status with offline', async () => {
    const params = {
      tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
      gatewayId: 'bbc41563473348d29a36b76e95c50381',
      activeTab: 'overview'
    }
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getGateway.url,
        (req, res, ctx) => res(ctx.json(gatewayResponse1))
      )
    )
    render(<Provider><RWGDetails /></Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/ruckus-wan-gateway/:gatewayId/gateway-details/:activeTab' }
    })
    expect(await screen.findByText('ruckusdemos')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(2)

  })

  it('should navidate to dns records correctly', async () => {
    const params = {
      tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
      gatewayId: 'bbc41563473348d29a36b76e95c50381',
      activeTab: 'overview'
    }
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getGateway.url,
        (req, res, ctx) => res(ctx.json(gatewayResponse))
      )
    )
    render(<Provider><RWGDetails /></Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/ruckus-wan-gateway/:gatewayId/gateway-details/:activeTab' }
    })
    expect(await screen.findByText('ruckusdemos')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(2)

    fireEvent.click(await screen.findByText('DNS Records (0)'))
    expect(mockNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/ruckus-wan-gateway/${params.gatewayId}/gateway-details/dnsRecords`,
      hash: '',
      search: ''
    })

  })

})
