import { Form } from 'antd'
import { rest } from 'msw'

import { useIsSplitOn }                                                                                                                                          from '@acx-ui/feature-toggle'
import { BasicServiceSetPriorityEnum, CommonUrlsInfo, GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum, OpenWlanAdvancedCustomization, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                              from '@acx-ui/store'
import { mockServer, render, screen, within }                                                                                                                    from '@acx-ui/test-utils'

import { mockedTunnelProfileViewData } from '../../../../../Policies/TunnelProfile/__tests__/fixtures'
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
  hasVxLanTunnelProfile: jest.fn().mockReturnValue(false)
}))

const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

describe('Network More settings - Vlan Tab', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVlanPoolList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.post(TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData)))
    )
  })

  it('should visible VLAN pooling', async () => {
    render(
      <Provider>
        <Form>
          <VlanTab wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/vlan pooling/i)
    expect(within(view).getByRole('switch')).toBeDisabled()
    // await userEvent.click(within(view).getByRole('switch'))
    // await userEvent.click(screen.getByRole('combobox', {
    //   name: /vlan pool:/i
    // }))
    // expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  it('should visible Dynamic VLAN', async () => {
    const data = {
      type: NetworkTypeEnum.AAA
    }

    render(
      <Provider>
        <NetworkFormContext.Provider value={{ data: data }} >
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
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const network = {
      type: NetworkTypeEnum.OPEN,
      wlan: {
        macAddressAuthentication: true
      }
    } as NetworkSaveData

    render(
      <Provider>
        <NetworkFormContext.Provider value={{ data: network }} >
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
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const network = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      wlan: {
        bypassCPUsingMacAddressAuthentication: true
      }
    } as NetworkSaveData

    render(
      <Provider>
        <NetworkFormContext.Provider value={{ data: network }} >
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
        <NetworkFormContext.Provider value={{ data: data }} >
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
})
