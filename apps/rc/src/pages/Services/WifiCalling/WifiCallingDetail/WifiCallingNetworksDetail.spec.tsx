import React from 'react'

import { act }  from '@testing-library/react'
import { rest } from 'msw'

import { networkApi }                                                    from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiCallingDetailContextType, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                               from '@acx-ui/store'
import { mockServer, render, screen }                                    from '@acx-ui/test-utils'

import { WifiCallingDetailContext } from './WifiCallingDetailView'
import WifiCallingNetworksDetail    from './WifiCallingNetworksDetail'

const wifiCallingNetworksDetail = {
  fields: [
    'clients',
    'aps',
    'description',
    'check-all',
    'ssid',
    'captiveType',
    'vlan',
    'name',
    'venues',
    'cog',
    'vlanPool',
    'id',
    'nwSubType'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      name: 'wlan1',
      id: '44c5604da90443968e1ee91706244e63',
      nwSubType: 'psk',
      venues: {
        count: 1,
        names: [
          'wlan1'
        ]
      }
    },
    {
      name: 'wlan2',
      id: 'c8cd8bbcb8cc42caa33c991437ecb983',
      nwSubType: 'open',
      venues: {
        count: 1,
        names: [
          'wlan2'
        ]
      }
    },
    {
      name: 'wlan3',
      id: '5cae9e28662447008ea86ec7c339661b',
      nwSubType: 'psk',
      venues: {
        count: 1,
        names: [
          'wlan3'
        ]
      }
    }
  ]
}

const wifiCallingDetail = {
  networkIds: [
    '44c5604da90443968e1ee91706244e63',
    'c8cd8bbcb8cc42caa33c991437ecb983',
    '5cae9e28662447008ea86ec7c339661b'
  ],
  description: 'for test',
  qosPriority: 'WIFICALLING_PRI_VOICE',
  serviceName: 'wifiCSP1',
  id: 'wifiCallingServiceId1',
  epdgs: [
    {
      ip: '1.2.3.4',
      domain: 'abc.com'
    }
  ]
}

const initState = {
  networkIds: [
    '44c5604da90443968e1ee91706244e63',
    'c8cd8bbcb8cc42caa33c991437ecb983',
    '5cae9e28662447008ea86ec7c339661b'
  ],
  setNetworkIds: () => {}
} as WifiCallingDetailContextType

describe('WifiCallingNetworksDetail', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render wifiCallingNetworksDetail successfully', async () => {
    mockServer.use(rest.post(
      CommonUrlsInfo.getVMNetworksList.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingNetworksDetail)
      )
    ), rest.get(
      WifiCallingUrls.getWifiCalling.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingDetail)
      )
    ))

    render(
      <WifiCallingDetailContext.Provider value={initState}>
        <Provider>
          <WifiCallingNetworksDetail />
        </Provider>
      </WifiCallingDetailContext.Provider>, {
        route: {
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getByRole('columnheader', {
      name: /network name/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /type/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /venues/i
    })).toBeTruthy()

    await screen.findByText('Open Network')
  })

  it('should render wifiCallingNetworksDetail error', async () => {
    mockServer.use(rest.get(
      WifiCallingUrls.getWifiCalling.url,
      (_, res, ctx) => res(
        ctx.status(500)
      )
    ),rest.post(
      CommonUrlsInfo.getVMNetworksList.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingNetworksDetail)
      )
    ))

    render(
      <WifiCallingDetailContext.Provider value={initState}>
        <Provider>
          <WifiCallingNetworksDetail />
        </Provider>
      </WifiCallingDetailContext.Provider>
      , {
        route: {
          path: '/services/wifiCalling/:serviceId/detail',
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.queryByText('wlan1')).not.toBeInTheDocument()
  })
})
