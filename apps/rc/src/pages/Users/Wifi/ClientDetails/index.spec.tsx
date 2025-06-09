import userEvent         from '@testing-library/user-event'
import { graphql, rest } from 'msw'

import { useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { apApi, clientApi }                             from '@acx-ui/rc/services'
import { CommonUrlsInfo, ClientUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { store, Provider, dataApiURL }                  from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import {
  clientList,
  clientApList,
  clientVenueList,
  clientReportList,
  clientNetworkList,
  histClientList,
  rbacClientInfo
} from '../__tests__/fixtures'

import ClientDetailPageHeader from './ClientDetailPageHeader'
import { events, eventsMeta } from './ClientTimelineTab/__tests__/fixtures'

import ClientDetails from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={`analytics-${key}`} title={key} />])
  return Object.fromEntries(sets)
})
jest.mock('@acx-ui/rc/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/rc/components'))
    .map(key => [key, () => <div data-testid={`rc-${key}`} title={key} />])
  return Object.fromEntries(sets)
})
jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report' />
}))

jest.mock('./ClientTimelineTab', () => () => {
  return <div data-testid='rc-ClientTimelineTab' />
})

jest.mock('./ClientReportsTab', () => () => {
  return <div data-testid='rc-ClientReportsTab' />
})

jest.mock('./ClientOverviewTab/ClientOverviewWidget', () => ({
  ...jest.requireActual('./ClientOverviewTab/ClientOverviewWidget'),
  ClientOverviewWidget: () => <div data-testid='ClientOverviewWidget' />
}))

jest.mock('./ClientOverviewTab/ClientProperties', () => ({
  ...jest.requireActual('./ClientOverviewTab/ClientProperties'),
  ClientProperties: () => <div data-testid='ClientProperties' />
}))

jest.mock('./ClientOverviewTab/RbacClientProperties', () => ({
  ...jest.requireActual('./ClientOverviewTab/RbacClientProperties'),
  RbacClientProperties: () => <div data-testid='ClientProperties' />
}))

jest.mock('./ClientOverviewTab/TopApplications', () => ({
  ...jest.requireActual('./ClientOverviewTab/TopApplications'),
  TopApplications: () => <div data-testid='TopApplications' />
}))


describe('ClientDetails', () => {
  const requestDisconnectClientSpy = jest.fn()
  beforeEach(() => {
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())
    mockServer.use(
      rest.post(CommonUrlsInfo.getEventList.url,
        (_, res, ctx) => res(ctx.json(events))),
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventsMeta))),
      rest.get(ClientUrlsInfo.getClientDetails.url,
        (_, res, ctx) => res(ctx.json(clientList[0]))),
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(clientApList[0]))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(clientNetworkList[0]))),
      rest.get(CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(clientVenueList[0]))),
      rest.post(CommonUrlsInfo.getHistoricalClientList.url,
        (_, res, ctx) => res(ctx.json(histClientList ))),
      graphql.link(dataApiURL).query('ClientStatisics', (_, res, ctx) =>
        res(ctx.data({ client: clientReportList[0] }))),
      rest.patch(ClientUrlsInfo.disconnectClient.url,
        (_, res, ctx) => {
          requestDisconnectClientSpy()
          return res(ctx.json({}))
        }),
      rest.post(ClientUrlsInfo.getClients.url, (_, res, ctx) => {
        return res(ctx.json(rbacClientInfo))
      })
    )
  })

  afterEach(() => {
    requestDisconnectClientSpy.mockClear()
  })

  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.spyOn(URLSearchParams.prototype, 'get').mockImplementation(key =>
      key === 'clientStatus' ? 'connected' : null
    )
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/:activeTab' }
    })
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(await screen.findByTestId('ClientOverviewWidget')).toBeVisible()
    expect(await screen.findByTestId('ClientProperties')).toBeVisible()
    expect(await screen.findAllByTestId('TopApplications')).toHaveLength(2)
    expect(await screen.findByTestId('analytics-TrafficByUsage')).toBeVisible()
    expect(await screen.findByTestId('analytics-TrafficByBand')).toBeVisible()

    fireEvent.click(await screen.findByRole('tab', { name: 'Reports' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/users/wifi/clients/${params.clientId}/details/reports`,
      hash: '',
      search: ''
    })
    expect(await screen.findByText('(')).toBeVisible()
    expect(await screen.findByText('Galaxy-S7-edge')).toBeVisible()
    expect(await screen.findByText(')')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/:activeTab' }
    })
    expect(await screen.findByText('Clients')).toBeVisible()
    expect(await screen.findByText('Wireless')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Clients List'
    })).toBeVisible()
  })

  it('should render correctly with featureToggle off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    jest.spyOn(URLSearchParams.prototype, 'get').mockImplementation(key =>
      key === 'clientStatus' ? 'connected' : null
    )
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/:activeTab' }
    })
    expect(await screen.findAllByRole('tab')).toHaveLength(4)

    fireEvent.click(await screen.findByRole('tab', { name: 'Reports' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/users/wifi/clients/${params.clientId}/details/reports`,
      hash: '',
      search: ''
    })
  })

  it('should navigate to troubleshooting tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'troubleshooting'
    }
    render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Troubleshooting')
  })

  it('should navigate to reports tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'reports'
    }
    render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/:activeTab' }
    })
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'timeline'
    }
    render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Timeline')
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'not-exist'
    }
    render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })

  it('should render ClientDetailPageHeader correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true) // mock Features.DEVICES
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    render(<Provider><ClientDetailPageHeader /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
    })
    await userEvent.click(await screen.findByText('Actions'))
    await userEvent.click(await screen.findByText('Disconnect Client'))
    await waitFor(() => {
      expect(requestDisconnectClientSpy).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedUsedNavigate).toBeCalled()
    })
  })
})
