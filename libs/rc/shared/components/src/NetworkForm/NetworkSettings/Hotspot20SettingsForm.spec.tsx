import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  IdentityProviderUrls,
  WifiOperatorUrls,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  cloudpathResponse,
  networkDeepResponse,
  mockHotspot20OperatorList,
  mockHotpost20IdentityProviderList
} from '../__tests__/fixtures'
import { MLOContext } from '../NetworkForm'

import { Hotspot20SettingsForm } from './Hotspot20SettingsForm'

jest.mocked(useIsSplitOn).mockReturnValue(true)

describe('Hotspot20SettingsForm', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Hotspot 20 network test'
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkDeepResponse] }))),
      rest.post(IdentityProviderUrls.getIdentityProviderList.url,
        (_, res, ctx) => res(ctx.json(mockHotpost20IdentityProviderList))),
      rest.post(WifiOperatorUrls.getWifiOperatorList.url,
        (_, res, ctx) => res(ctx.json(mockHotspot20OperatorList))
      )
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should render Hotspot 20 Network correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <MLOContext.Provider value={{
        isDisableMLO: true,
        disableMLO: jest.fn
      }}>
        <Form>
          <Hotspot20SettingsForm />
        </Form>
      </MLOContext.Provider>
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Hotspot 2.0 Settings/i)).toBeInTheDocument()
    expect(await screen.findByText(/Security Protocol/i)).toBeInTheDocument()
    expect(await screen.findByText(/Wi-Fi Operator/i)).toBeInTheDocument()
    expect(await screen.findByText(/Identity Provider/i)).toBeInTheDocument()
  })
})

