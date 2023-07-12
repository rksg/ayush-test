import React from 'react'

import { act }  from '@testing-library/react'
import { rest } from 'msw'

import { useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import { serviceApi }                                    from '@acx-ui/rc/services'
import { WifiCallingDetailContextType, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider, store }                               from '@acx-ui/store'
import { mockServer, render, screen }                    from '@acx-ui/test-utils'

import WifiCallingDetailView, { WifiCallingDetailContext } from './WifiCallingDetailView'

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
    },
    {
      domain: 'a.b.c.com'
    }
  ]
}

const initState = {} as WifiCallingDetailContextType

describe('WifiCallingDetailView', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(serviceApi.util.resetApiState())
    })
  })

  it('should render wifiCallingDetailContent successfully', async () => {
    mockServer.use(rest.get(
      WifiCallingUrls.getWifiCalling.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingDetail)
      )
    ))

    render(
      <WifiCallingDetailContext.Provider value={initState}>
        <Provider>
          <WifiCallingDetailView />
        </Provider>
      </WifiCallingDetailContext.Provider>
      , {
        route: {
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByText(/for test/i)
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <WifiCallingDetailContext.Provider value={initState}>
        <Provider>
          <WifiCallingDetailView />
        </Provider>
      </WifiCallingDetailContext.Provider>
      , {
        route: {
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('My Services')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Services'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <WifiCallingDetailContext.Provider value={initState}>
        <Provider>
          <WifiCallingDetailView />
        </Provider>
      </WifiCallingDetailContext.Provider>
      , {
        route: {
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Wi-Fi Calling'
    })).toBeVisible()
  })
})
