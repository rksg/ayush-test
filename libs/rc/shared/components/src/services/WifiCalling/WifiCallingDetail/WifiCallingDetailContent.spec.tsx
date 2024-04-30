import React from 'react'

import { rest } from 'msw'

import { serviceApi }                                      from '@acx-ui/rc/services'
import { ServicesConfigTemplateUrlsInfo, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                 from '@acx-ui/store'
import { act, mockServer, render, screen }                 from '@acx-ui/test-utils'

import { mockWifiCallingDetail } from '../__tests__/fixtures'

import WifiCallingDetailContent from './WifiCallingDetailContent'

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

describe('WifiCallingDetailContent', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(serviceApi.util.resetApiState())
    })

    mockServer.use(
      rest.get(WifiCallingUrls.getWifiCalling.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingDetail))),
      rest.get(ServicesConfigTemplateUrlsInfo.getWifiCalling.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingDetail)))
    )
  })

  it('should render wifiCallingDetailContent successfully', async () => {
    render(
      <WifiCallingDetailContent />
      , {
        wrapper: wrapper,
        route: {
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByText(mockWifiCallingDetail.serviceName)

    expect(screen.getByText(/description/i)).toBeTruthy()
    expect(screen.getByText(/service name/i)).toBeTruthy()
    expect(screen.getByText(/qos priority/i)).toBeTruthy()
    expect(screen.getByText(/evolved packet data gateway \(epdg\)/i)).toBeTruthy()
  })
})
