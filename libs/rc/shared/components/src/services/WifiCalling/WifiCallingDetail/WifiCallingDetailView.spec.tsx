import { rest } from 'msw'

import { serviceApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  ServicesConfigTemplateUrlsInfo,
  WifiCallingDetailContextType,
  WifiCallingUrls
} from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { act, mockServer, render, screen } from '@acx-ui/test-utils'

import { mockWifiCallingDetail } from '../__tests__/fixtures'

import { WifiCallingDetailContext, WifiCallingDetailView } from './WifiCallingDetailView'

const initState = {} as WifiCallingDetailContextType

describe('WifiCallingDetailView', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(serviceApi.util.resetApiState())
    })
    mockServer.use(
      rest.get(WifiCallingUrls.getWifiCalling.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingDetail))),
      rest.get(ServicesConfigTemplateUrlsInfo.getWifiCalling.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingDetail))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) =>
          res(ctx.json({
            fields: ['name', 'id'],
            totalCount: 0,
            page: 1,
            data: []
          }))
      )
    )
  })

  it('should render wifiCallingDetailContent successfully', async () => {
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

  it('should render breadcrumb correctly', async () => {
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
