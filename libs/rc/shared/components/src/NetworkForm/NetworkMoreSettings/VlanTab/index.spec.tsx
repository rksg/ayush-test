import { Form } from 'antd'
import { rest } from 'msw'

import { Features, useIsSplitOn }                                                                                                                              from '@acx-ui/feature-toggle'
import { BasicServiceSetPriorityEnum, GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum, OpenWlanAdvancedCustomization, TunnelProfileUrls, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                            from '@acx-ui/store'
import { mockServer, render, screen, within }                                                                                                                  from '@acx-ui/test-utils'

import { mockedTunnelProfileViewData } from '../../__tests__/fixtures'
import NetworkFormContext              from '../../NetworkFormContext'

import { VlanTab } from '.'


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

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  useNetworkVxLanTunnelProfileInfo: jest.fn().mockReturnValue({ enableVxLan: false })
}))

const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

describe('Network More settings - Vlan Tab', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(WifiUrlsInfo.getVlanPools.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.post(TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData)))
    )
  })

  it('should visible Dynamic VLAN', async () => {
    const data = {
      type: NetworkTypeEnum.AAA,
      wlan: {
      }
    }

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          data: data, editMode: false, cloneMode: false, setData: () => {}
        }} >
          <Form>
            <VlanTab wlanData={mockWlanData} />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    const vlanIdInput = await screen.findByRole('spinbutton', { name: 'VLAN ID' })
    expect(vlanIdInput).toBeEnabled()

    const dynamicVlanView = screen.getByText(/Dynamic VLAN/i)
    expect(within(dynamicVlanView).getByRole('switch')).toBeVisible()
  })

  it('should visible Dynamic VLAN on OPEN WLAN with Mac Authentication', async () => {
    const network = {
      type: NetworkTypeEnum.OPEN,
      wlan: {
        macAddressAuthentication: true
      }
    } as NetworkSaveData

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          data: network, editMode: false, cloneMode: false, setData: () => {}
        }} >
          <Form>
            <VlanTab wlanData={mockWlanData} />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    const vlanIdInput = await screen.findByRole('spinbutton', { name: 'VLAN ID' })
    expect(vlanIdInput).toBeEnabled()

    const dynamicVlanView = screen.getByText(/Dynamic VLAN/i)
    expect(within(dynamicVlanView).getByRole('switch')).toBeVisible()
  })

  it('should visible Dynamic VLAN on CaptivePortal WLAN with Mac Auth Bypass', async () => {
    const network = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.WISPr
      },
      wlan: {
        bypassCPUsingMacAddressAuthentication: true
      }
    } as NetworkSaveData

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          data: network, editMode: false, cloneMode: false, setData: () => {}
        }} >
          <Form>
            <VlanTab wlanData={mockWlanData} />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    const vlanIdInput = await screen.findByRole('spinbutton', { name: 'VLAN ID' })
    expect(vlanIdInput).toBeEnabled()

    const dynamicVlanView = screen.getByText(/Dynamic VLAN/i)
    expect(within(dynamicVlanView).getByRole('switch')).toBeVisible()
  })

  it('should use default VLAN ID when enabling DHCP', async () => {
    const data = {
      enableDhcp: true,
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.ClickThrough
      }
    }

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          data: data, editMode: false, cloneMode: false, setData: () => {}
        }} >
          <Form>
            <VlanTab wlanData={mockWlanData} />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    const vlanIdInput = await screen.findByRole('spinbutton', { name: 'VLAN ID' })
    expect(vlanIdInput).toBeDisabled()
    expect(vlanIdInput.getAttribute('value')).toBe('3000')
  })

  it('should use default VLAN ID on PSK WLAN With Mac Authentication', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NETWORK_PSK_MACAUTH_DYNAMIC_VLAN_TOGGLE)
    const network = {
      type: NetworkTypeEnum.PSK,
      wlan: {
        macAddressAuthentication: true
      }
    } as NetworkSaveData

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          data: network, editMode: false, cloneMode: false, setData: () => {}
        }} >
          <Form>
            <VlanTab wlanData={mockWlanData} />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    const vlanIdInput = await screen.findByRole('spinbutton', { name: 'VLAN ID' })
    expect(vlanIdInput).toBeEnabled()

    const dynamicVlanView = screen.getByText(/Dynamic VLAN/i)
    expect(within(dynamicVlanView).getByRole('switch')).toBeVisible()
  })
})
