import React from 'react'

import { act }  from '@testing-library/react'
import { rest } from 'msw'

import { networkApi }                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { mockServer, render, screen }      from '@acx-ui/test-utils'

import WifiCallingNetworksDetail from './WifiCallingNetworksDetail'

const wifiCallingNetworksDetail = [
  {
    name: 'wlan1',
    id: '1',
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
    id: '2',
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
    id: '3',
    nwSubType: 'psk',
    venues: {
      count: 1,
      names: [
        'wlan3'
      ]
    }
  }
]

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

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
    ))

    render(
      <WifiCallingNetworksDetail tenantId={'tenantId'}/>, {
        wrapper: wrapper,
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
  })

  it('should render wifiCallingNetworksDetail error', async () => {
    mockServer.use(rest.get(
      WifiCallingUrls.getWifiCalling.url,
      (_, res, ctx) => res(
        ctx.status(500)
      )
    ))

    render(
      <WifiCallingNetworksDetail tenantId={'tenantId'}/>, {
        wrapper: wrapper,
        route: {
          path: '/services/wifiCalling/:serviceId/detail',
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.queryByText('wlan1')).not.toBeInTheDocument()
  })
})
