import React from 'react'

import { act }  from '@testing-library/react'
import { rest } from 'msw'

import { serviceApi }                 from '@acx-ui/rc/services'
import { WifiCallingUrls }            from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import WifiCallingDetailContent from './WifiCallingDetailContent'

const wifiCallingDetail = {
  ePDG: [{
    domain: 'aaa.bbb.com',
    ip: '10.10.10.10'
  }],
  qosPriority: 'WIFICALLING_PRI_VOICE',
  description: 'des1',
  serviceName: 'carrierName1',
  serviceHealth: [
    { name: 'network1', value: 75 },
    { name: 'network2', value: 20 },
    { name: 'network3', value: 5 }
  ]
}

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
  })

  it('should render wifiCallingDetailContent successfully', async () => {
    mockServer.use(rest.get(
      WifiCallingUrls.getWifiCalling.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingDetail)
      )
    ))

    render(
      <WifiCallingDetailContent tenantId={'tenantId'}/>
      , {
        wrapper: wrapper,
        route: {
          path: '/services/wifiCalling/:serviceId/details',
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByText('des1')

    expect(screen.getByText(/description/i)).toBeTruthy()
    expect(screen.getByText(/service name/i)).toBeTruthy()
    expect(screen.getByText(/qos priority/i)).toBeTruthy()
    expect(screen.getByText(/evolved packet data gateway \(epdg\)/i)).toBeTruthy()
  })

  it('should render wifiCallingDetailContent error', async () => {
    mockServer.use(rest.get(
      WifiCallingUrls.getWifiCalling.url,
      (_, res, ctx) => res(
        ctx.status(500)
      )
    ))

    render(
      <WifiCallingDetailContent tenantId={'tenantId'}/>, {
        wrapper: wrapper,
        route: {
          path: '/services/wifiCalling/:serviceId/details',
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    const target = screen.getByTestId('target')
    expect(target.textContent).toEqual('Detail Error')
  })
})
