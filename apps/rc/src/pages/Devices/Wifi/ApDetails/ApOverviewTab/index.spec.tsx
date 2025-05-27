import '@testing-library/jest-dom'
import { rest } from 'msw'

import { apApi }                                          from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store  }                               from '@acx-ui/store'
import { mockServer, render, screen }                     from '@acx-ui/test-utils'

import {
  apDetailData,
  apDetails,
  apLanPorts,
  apPhoto,
  apPhotoFromRbacApi,
  apRadio,
  apViewModel
} from '../__tests__/fixtures'

import { ApOverviewTab } from '.'

/* eslint-disable max-len */
jest.mock('@acx-ui/analytics/components', () => ({
  ConnectedClientsOverTime: () => <div data-testid={'analytics-ConnectedClientsOverTime'} title='ConnectedClientsOverTime' />,
  NetworkHistory: () => <div data-testid={'analytics-NetworkHistory'} title='NetworkHistory' />,
  TopApplicationsByTraffic: () => <div data-testid={'analytics-TopApplicationsByTraffic'} title='TopApplicationsByTraffic' />,
  TopSSIDsByClient: () => <div data-testid={'analytics-TopSSIDsByClient'} title='TopSSIDsByClient' />,
  TopSSIDsByTraffic: () => <div data-testid={'analytics-TopSSIDsByTraffic'} title='TopSSIDsByTraffic' />,
  TrafficByVolume: () => <div data-testid={'analytics-TrafficByVolume'} title='TrafficByVolume' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  TopologyFloorPlanWidget: () => <div data-testid={'rc-TopologyFloorPlanWidget'} title='TopologyFloorPlanWidget' />,
  ApInfoWidget: () => <div data-testid={'rc-ApInfoWidget'} title='ApInfoWidget' />
}))
/* eslint-enable */

const params = {
  tenantId: 'tenant-id',
  serialNumber: 'ap-serialNumber',
  activeTab: 'overview'
}
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useApContext: () => params
}))

describe('ApOverviewTab', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getApDetailHeader.url,
        (_, res, ctx) => res(ctx.json(apDetailData))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(apViewModel))
      ),
      rest.get(
        WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(apDetails))
      ),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json({
          address: {
            latitude: 37.4112751,
            longitude: -122.0191908
          }
        }))
      ),
      rest.get(
        WifiUrlsInfo.getApLanPorts.url,
        (_, res, ctx) => res(ctx.json(apLanPorts))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApLanPorts.url,
        (_, res, ctx) => res(ctx.json(apLanPorts))
      ),
      rest.get(
        WifiUrlsInfo.getApRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(apRadio))
      ),
      rest.get(
        WifiUrlsInfo.getApPhoto.url,
        (_, res, ctx) => res(ctx.json(apPhoto))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApPhoto.url,
        (_, res, ctx) => res(ctx.json(apPhotoFromRbacApi))
      )
    )
  })


  it('renders correctly', async () => {
    render(<Provider><ApOverviewTab /></Provider>, { route: { params } })
    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(6)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(2)
  })

})
