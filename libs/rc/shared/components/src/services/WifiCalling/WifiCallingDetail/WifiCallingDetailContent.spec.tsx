import React from 'react'

import { rest } from 'msw'

import { Features, useIsSplitOn }                                                               from '@acx-ui/feature-toggle'
import { serviceApi }                                                                           from '@acx-ui/rc/services'
import { ApiVersionEnum, GetApiVersionHeader, ServicesConfigTemplateUrlsInfo, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                                                      from '@acx-ui/store'
import { act, mockServer, render, screen, waitFor }                                             from '@acx-ui/test-utils'

import { mockWifiCallingDetail, mockWifiCallingNetworksDetail } from '../__tests__/fixtures'

import WifiCallingDetailContent from './WifiCallingDetailContent'

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

describe('WifiCallingDetailContent', () => {
  const rbacGetApiHeaders = GetApiVersionHeader(ApiVersionEnum.v1_1)
  const rbacGetApiFn = jest.fn()
  beforeEach(() => {
    rbacGetApiFn.mockClear()
    act(() => {
      store.dispatch(serviceApi.util.resetApiState())
    })

    mockServer.use(
      rest.get(WifiCallingUrls.getWifiCalling.url,
        (req, res, ctx) => {
          if (req.headers.get('content-type') === rbacGetApiHeaders?.['Content-Type']) {
            rbacGetApiFn()
            return res(ctx.json(mockWifiCallingNetworksDetail))
          } else {
            return res(ctx.json(mockWifiCallingDetail))
          }
        }),
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

  it('should call rbac api and render correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    const viewmodelFn = jest.fn()

    mockServer.use(
      rest.post(
        WifiCallingUrls.queryWifiCalling.url,
        (_, res, ctx) => {
          viewmodelFn()
          return res(ctx.json({}))
        }
      )
    )

    render(
      <WifiCallingDetailContent />
      , {
        wrapper: wrapper,
        route: {
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    await waitFor(() => expect(rbacGetApiFn).toHaveBeenCalled())
    await waitFor(() => expect(viewmodelFn).toHaveBeenCalled())
  })
})
