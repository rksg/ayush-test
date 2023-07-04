import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, ClientUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                     from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import {
  apCaps,
  clientList,
  clientApList,
  clientVenueList,
  clientReportList,
  clientNetworkList,
  eventMetaList,
  histClientList
} from '../__tests__/fixtures'

import ClientDetailPageHeader from './ClientDetailPageHeader'
import { events, eventsMeta } from './ClientTimelineTab/__tests__/fixtures'

import ClientDetails from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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

describe('ClientDetails', () => {
  beforeEach(() => {
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
      rest.post(CommonUrlsInfo.getHistoricalStatisticsReportsV2.url,
        (_, res, ctx) => res(ctx.json(clientReportList[0]))),
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventMetaList))),
      rest.get(WifiUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(apCaps))),
      rest.post(ClientUrlsInfo.disconnectClient.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it.skip('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('hostname')
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    const { asFragment } = render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })
    expect(screen.getAllByRole('tab')).toHaveLength(4)

    const fragment = asFragment()
    // eslint-disable-next-line testing-library/no-node-access
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')

    fireEvent.click(await screen.findByRole('tab', { name: 'Reports' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/users/wifi/clients/${params.clientId}/details/reports`,
      hash: '',
      search: ''
    })
  })

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(screen.queryByText('Clients')).toBeNull()
    expect(screen.queryByText('Wireless')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Wi-Fi Users'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(await screen.findByText('Clients')).toBeVisible()
    expect(await screen.findByText('Wireless')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Clients List'
    })).toBeVisible()
  })

  it('should render correctly with featureToggle off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('hostname')
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    const { asFragment } = render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(await screen.findAllByRole('tab')).toHaveLength(4)

    const fragment = asFragment()
    // eslint-disable-next-line testing-library/no-node-access
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')

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
      route: { params, path: '/:tenantId/t/users/wifi/:activeTab/:clientId/details/:activeTab' }
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
      route: { params, path: '/:tenantId/t/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'timeline'
    }
    render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wifi/:activeTab/:clientId/details/:activeTab' }
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
      route: { params, path: '/:tenantId/t/users/wifi/:activeTab/:clientId/details/:activeTab' }
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
  })
})
