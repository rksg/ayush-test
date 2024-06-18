import { rest } from 'msw'

import { networkApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo, ConfigTemplateUrlsInfo, ServicesConfigTemplateUrlsInfo,
  WifiCallingDetailContextType,
  WifiCallingUrls
} from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { act, mockServer, render, screen } from '@acx-ui/test-utils'

import {
  mockWifiCallingDetail,
  mockWifiCallingNetworksDetail
} from '../__tests__/fixtures'

import { WifiCallingDetailContext } from './WifiCallingDetailView'
import WifiCallingNetworksDetail    from './WifiCallingNetworksDetail'

const initState = {
  networkIds: [
    '44c5604da90443968e1ee91706244e63',
    'c8cd8bbcb8cc42caa33c991437ecb983',
    '5cae9e28662447008ea86ec7c339661b'
  ],
  setNetworkIds: () => {}
} as WifiCallingDetailContextType

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('WifiCallingNetworksDetail', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })

    mockServer.use(
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingNetworksDetail))),
      rest.get(WifiCallingUrls.getWifiCalling.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingDetail))),
      rest.get(ServicesConfigTemplateUrlsInfo.getWifiCalling.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingDetail))),
      rest.post(ConfigTemplateUrlsInfo.getNetworkTemplateList.url,
        (req, res, ctx) => res(ctx.json(mockWifiCallingNetworksDetail)))
    )
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
  })

  it('should render wifiCallingNetworksDetail successfully', async () => {
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

    expect(await screen.findByText('Open Network')).toBeInTheDocument()
  })

  it('should render wifiCallingNetworksDetail successfully with configTemplate', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
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

    expect(await screen.findByText('Open Network')).toBeInTheDocument()
  })

  it('should render wifiCallingNetworksDetail error', async () => {
    mockServer.use(
      rest.get(WifiCallingUrls.getWifiCalling.url,
        (_, res, ctx) => res(
          ctx.status(500)
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

    expect(screen.queryByText(mockWifiCallingNetworksDetail.data[0].name)).not.toBeInTheDocument()
  })
})
