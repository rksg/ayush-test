import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  AccessControlUrls,
  CommonUrlsInfo,
  NetworkSaveData,
  EdgePinUrls,
  BasicServiceSetPriorityEnum,
  OpenWlanAdvancedCustomization,
  TunnelProfileUrls,
  WifiUrlsInfo,
  FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockApModelFamilies }                        from '../../ApCompatibility/__test__/fixtures'
import {
  mockedTunnelProfileViewData,
  devicePolicyListResponse,
  externalProviders,
  mockGuestMoreData,
  policyListResponse,
  mockHotspot20MoreData, devicePolicyDetailResponse
} from '../__tests__/fixtures'
import NetworkFormContext, { NetworkFormContextType } from '../NetworkFormContext'

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
      rest.post(AccessControlUrls.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(devicePolicyListResponse))),
      rest.post(AccessControlUrls.getDevicePolicyListQuery.url,
        (req, res, ctx) => res(ctx.json(devicePolicyListResponse))),
      rest.get(AccessControlUrls.getDevicePolicy.url,
        (req, res, ctx) => res(ctx.json(devicePolicyDetailResponse))),
      rest.post(AccessControlUrls.getEnhancedL2AclPolicies.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(AccessControlUrls.getL2AclPolicyListQuery.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(AccessControlUrls.getEnhancedL3AclPolicies.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(AccessControlUrls.getL3AclPolicyListQuery.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(AccessControlUrls.getEnhancedApplicationPolicies.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(AccessControlUrls.getApplicationPolicyListQuery.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(AccessControlUrls.getEnhancedAccessControlProfiles.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(AccessControlUrls.getAccessControlProfileQueryList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(CommonUrlsInfo.getWifiCallingProfileList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(WifiUrlsInfo.getVlanPools.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(CommonUrlsInfo.getExternalProviders.url,
        (_, res, ctx) => res(ctx.json(externalProviders))),
      rest.post(TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))),
      rest.post(EdgePinUrls.getEdgePinStatsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))),
      rest.post(FirmwareUrlsInfo.getApModelFamilies.url,
        (_, res, ctx) => res(ctx.json(mockApModelFamilies)))
    )
  })

  it('should render More settings form successfully', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
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

  it('should render More settings form with Hotspot2.0 tab successfully', async () => {

    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockContextData = {
      editMode: true,
      data: mockHotspot20MoreData } as NetworkFormContextType

    render(MockedMoreSettingsForm(mockWlanData, mockContextData), { route: { params } })

    const tabs = await screen.findAllByRole('tab')
    // Hotspot 2.0 tab will be shown when network type is hotspot20
    expect(tabs.length).toBe(6)
    const hotspot20Tab = tabs[1]
    await userEvent.click(hotspot20Tab)
    expect(hotspot20Tab.textContent).toBe('Hotspot 2.0')
    await userEvent.click(hotspot20Tab)

    expect(hotspot20Tab.getAttribute('aria-selected')).toBeTruthy()
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
