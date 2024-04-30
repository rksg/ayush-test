import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import {
  AccessControlUrls,
  CommonUrlsInfo,
  NetworkSaveData,
  BasicServiceSetPriorityEnum,
  OpenWlanAdvancedCustomization,
  TunnelProfileUrls,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockedTunnelProfileViewData, devicePolicyListResponse, externalProviders, mockGuestMoreData, policyListResponse } from '../__tests__/fixtures'
import NetworkFormContext, { NetworkFormContextType }                                                                      from '../NetworkFormContext'

import { NetworkMoreSettingsForm } from './NetworkMoreSettingsForm'


const mockWlanData = {
  name: 'test',
  type: 'open',
  isCloudpathEnabled: false,
  venues: [],
  wlan: {
    advancedCustomization: {
      bssPriority: BasicServiceSetPriorityEnum.LOW
    } as OpenWlanAdvancedCustomization
  }
} as NetworkSaveData


describe('NetworkMoreSettingsForm', () => {
  beforeEach(() => {

    mockServer.use(
      rest.get(AccessControlUrls.getDevicePolicyList.url,
        (req, res, ctx) => res(ctx.json(devicePolicyListResponse))),
      rest.get(AccessControlUrls.getL2AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(AccessControlUrls.getL3AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(AccessControlUrls.getAppPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(CommonUrlsInfo.getWifiCallingProfileList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(WifiUrlsInfo.getVlanPools.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(AccessControlUrls.getAccessControlProfileList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(CommonUrlsInfo.getExternalProviders.url,
        (_, res, ctx) => res(ctx.json(externalProviders))),
      rest.post(TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData)))
    )
  })

  it('should render More settings form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <NetworkMoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>, {
        route: { params }
      })
    const button = screen.getByText(/show more settings/i)
    await userEvent.click(button)

    expect(asFragment()).toMatchSnapshot()

    const tabs = await screen.findAllByRole('tab')
    // The User Connection tab is hidden when the nwtwork type is not Captive Portal
    // The Advanced tab is hidden when the QoS feature flag are turned Off
    expect(tabs.length).toBe(5)
    const networkControlTab = tabs[1]
    await userEvent.click(networkControlTab)

    expect(networkControlTab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should render More settings form successfully with edit mode', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockContextData = { editMode: true, data: mockGuestMoreData } as NetworkFormContextType

    render(MockedMoreSettingsForm(mockWlanData, mockContextData), { route: { params } })

    const tabs = await screen.findAllByRole('tab')
    expect(tabs.length).toBe(6)
  })

})

// eslint-disable-next-line max-len
export function MockedMoreSettingsForm (wlanData: NetworkSaveData, networkFormContext: NetworkFormContextType) {
  return (
    <Provider>
      <NetworkFormContext.Provider value={networkFormContext}>
        <Form>
          <NetworkMoreSettingsForm wlanData={wlanData} />
        </Form>
      </NetworkFormContext.Provider>
    </Provider>
  )
}
