import { rest } from 'msw'

import { useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, ClientUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                     from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
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

import ClientDetails from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
/* eslint-disable max-len */
jest.mock('@acx-ui/analytics/components', () => ({
  TrafficByBand: () => <div data-testid={'analytics-TrafficByBand'} title='TrafficByBand' />,
  TrafficByUsage: () => <div data-testid={'analytics-TrafficByUsage'} title='TrafficByUsage' />,
  ClientTroubleshooting: () => <div data-testid={'analytics-ClientTroubleshooting'} title='ClientTroubleshooting' />
}))

describe('ClientDetails', () => {
  mockServer.use(
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
      (_, res, ctx) => res(ctx.json(apCaps)))
  )

  it('should render correctly', async () => {
    jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('hostname')
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    const { asFragment } = render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getAllByRole('tab')).toHaveLength(4)

    const fragment = asFragment()
    // eslint-disable-next-line testing-library/no-node-access
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
    expect(fragment).toMatchSnapshot()

    fireEvent.click(await screen.findByRole('tab', { name: 'Reports' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/users/wifi/clients/${params.clientId}/details/reports`,
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
    const { asFragment } = render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to reports tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'reports'
    }
    const { asFragment } = render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'timeline'
    }
    const { asFragment } = render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'not-exist'
    }
    render(<Provider><ClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
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
      route: { params, path: '/:tenantId/users/wifi/clients' }
    })
  })
})
