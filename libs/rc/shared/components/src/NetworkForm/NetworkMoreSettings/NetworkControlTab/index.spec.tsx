import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                                                                                                    from '@acx-ui/feature-toggle'
import { AccessControlUrls, BasicServiceSetPriorityEnum, MtuTypeEnum, NetworkSaveData, OpenWlanAdvancedCustomization, TunnelProfileUrls, TunnelTypeEnum, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                                        from '@acx-ui/store'
import { mockServer, render, screen, within }                                                                                                                              from '@acx-ui/test-utils'

import { mockedTunnelProfileViewData, devicePolicyListResponse, policyListResponse } from '../../__tests__/fixtures'
import NetworkFormContext                                                            from '../../NetworkFormContext'
import { useNetworkVxLanTunnelProfileInfo }                                          from '../../utils'

import { NetworkControlTab } from '.'



const mockWlanData = {
  name: 'test',
  type: 'open',
  isCloudpathEnabled: false,
  venues: [],
  wlan: {
    advancedCustomization: {
      dnsProxyEnabled: true,
      dnsProxy: {
        dnsProxyRules: [{
          domainName: 'test.com',
          ipList: ['192.168.0.100']
        }]
      },
      bssPriority: BasicServiceSetPriorityEnum.LOW
    } as OpenWlanAdvancedCustomization
  }
} as NetworkSaveData

const mockWifiCallingList = [
  {
    qosPriority: 'WIFICALLING_PRI_VOICE',
    serviceName: 'joe-wc1',
    id: 'wifi-calling-id',
    epdgs: [
      {
        domain: 'test.com'
      },
      {
        domain: 'test2.com'
      }
    ]
  }
]

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  useNetworkVxLanTunnelProfileInfo: jest.fn().mockReturnValue({
    enableTunnel: false,
    enableVxLan: false,
    vxLanTunnels: undefined
  })
}))

const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

describe('Network More settings - Network Control Tab', () => {
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
      rest.get(AccessControlUrls.getAccessControlProfileList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(WifiCallingUrls.getWifiCallingList.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingList))),
      rest.post(TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData)))
    )
  })

  it('after click DNS Proxy', async () => {

    render(
      <Provider>
        <Form>
          <NetworkControlTab wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/DNS Proxy/i)
    const dnsProxyBtn = within(view).getByRole('switch')
    expect(dnsProxyBtn).toBeVisible()
    await userEvent.click(dnsProxyBtn)
    expect(dnsProxyBtn.getAttribute('aria-checked')).toBe('true')

    expect(await screen.findByRole('button', { name: 'Manage' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    expect(dnsProxyBtn.getAttribute('aria-checked')).toBe('false')

  })

  it('after click DNS Proxy with data', async () => {
    const data = {
      wlan: {
        advancedCustomization: {
          dnsProxyEnabled: true,
          dnsProxy: {
            dnsProxyRules: [{
              domainName: 'test.com',
              ipList: ['192.168.0.100']
            }]
          }
        }
      }
    } as NetworkSaveData

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          data: data, editMode: false, cloneMode: false, setData: () => {}
        }} >
          <Form>
            <NetworkControlTab wlanData={mockWlanData} />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/DNS Proxy/i)
    const dnsProxyBtn = within(view).getByRole('switch')
    expect(dnsProxyBtn).toBeVisible()
    await userEvent.click(dnsProxyBtn)
    expect(await screen.findByRole('button', { name: /Manage/i })).toBeVisible()
  })


  it('after click Wifi calling', async () => {

    render(
      <Provider>
        <Form>
          <NetworkControlTab wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/Wi-Fi Calling/i)
    const wifiCallingBtn = within(view).getByRole('switch')
    expect(wifiCallingBtn).toBeVisible()
    await userEvent.click(wifiCallingBtn)
    expect(wifiCallingBtn.getAttribute('aria-checked')).toBe('true')

    const selectBtn = await screen.findByRole('button', { name: /Select profiles/i })
    expect(selectBtn).toBeVisible()
    userEvent.click(selectBtn)

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    expect(saveBtn).toBeVisible()
    //await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
    //expect(wifiCallingBtn.getAttribute('aria-checked')).toBe('false')

  })

  xit('after click Wifi calling with data', async () => {
    const data = {
      wlan: {
        advancedCustomization: {
          wifiCallingIds: [ 'wifi-calling-id' ],
          dnsProxyEnabled: true,
          dnsProxy: {
            dnsProxyRules: [{
              domainName: 'test.com',
              ipList: ['192.168.0.100']
            }]
          }
        }
      }
    } as NetworkSaveData
    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          data: data, editMode: false, cloneMode: false, setData: () => {}
        }} >
          <Form>
            <NetworkControlTab wlanData={mockWlanData} />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/Wi-Fi Calling/i)
    const wifiCallingBtn = within(view).getByRole('switch')
    expect(wifiCallingBtn).toBeVisible()
    await userEvent.click(wifiCallingBtn)
    expect(wifiCallingBtn.getAttribute('aria-checked')).toBe('true')

    const selectBtn = await screen.findByRole('button', { name: /Select profiles/i })
    expect(selectBtn).toBeVisible()
    userEvent.click(selectBtn)

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    expect(saveBtn).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
    //expect(wifiCallingBtn.getAttribute('aria-checked')).toBe('false')
  })

  it('after click Client Isolation', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <Form>
          <NetworkControlTab wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/client isolation/i)
    await userEvent.click(within(view).getByRole('switch'))

    expect(screen.getByText(/automatic support for vrrp\/hsrp/i)).toBeVisible()
    expect(screen.getByText(/client isolation allowlist by venue/i)).toBeVisible()
  })

  it('after click Anti-spoofing', async () => {
    render(
      <Provider>
        <Form>
          <NetworkControlTab wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/anti\-spoofing/i)
    await userEvent.click(within(view).getByRole('switch'))

    expect(screen.getByText(/arp request rate limit/i)).toBeVisible()
    expect(screen.getByText(/dhcp request rate limit/i)).toBeVisible()
  })

  xit('after click Access Control', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <NetworkControlTab wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const layer2 = screen.getByText(/layer 2/i)
    await userEvent.click(within(layer2).getByRole('switch'))
    await userEvent.click(within(layer2).getByRole('combobox'))
    expect(screen.getByText('No Data')).toBeInTheDocument()
    await userEvent.click(within(layer2).getByRole('switch'))

    const layer3 = screen.getByText(/layer 3/i)
    await userEvent.click(within(layer3).getByRole('switch'))
    await userEvent.click(within(layer3).getByRole('combobox'))
    expect(within(layer3).getByText(/add/i)).toBeVisible()
    expect(screen.getByText('No Data')).toBeInTheDocument()
    await userEvent.click(within(layer3).getByRole('switch'))

    const deviceOs = screen.getByText(/device & os/i)
    await userEvent.click(within(deviceOs).getByRole('switch'))
    await userEvent.click(within(deviceOs).getByRole('combobox'))
    expect(within(deviceOs).getByText(/add/i)).toBeVisible()
    expect(screen.getByText('No Data')).toBeInTheDocument()
    await userEvent.click(within(deviceOs).getByRole('switch'))

    const applications = screen.getByText(/applications/i)
    await userEvent.click(within(applications).getByRole('switch'))
    await userEvent.click(within(applications).getByRole('combobox'))
    expect(within(applications).getByText(/add/i)).toBeVisible()
    expect(screen.getByText('No Data')).toBeInTheDocument()
    await userEvent.click(within(applications).getByRole('switch'))

    const clientRateLimit = screen.getByText(/client rate limit/i)
    await userEvent.click(within(clientRateLimit).getByRole('switch'))
    expect(screen.getByText(/upload limit/i)).toBeVisible()
    expect(screen.getByText(/download limit/i)).toBeVisible()

    const uploadLimitCheckbox = screen.getByTestId('enableUploadLimit')
    await userEvent.click(uploadLimitCheckbox)
    expect(screen.getByText(/200 mbps/i)).toBeVisible()
    await userEvent.click(uploadLimitCheckbox)

    const downloadLimitCheckbox = screen.getByTestId('enableDownloadLimit')
    await userEvent.click(downloadLimitCheckbox)
    expect(screen.getByText(/200 mbps/i)).toBeVisible()
    await userEvent.click(downloadLimitCheckbox)

  })

  it('should display tunnel profile when it use VxLan tunnel', async () => {
    jest.mocked(useNetworkVxLanTunnelProfileInfo).mockReturnValue({
      enableTunnel: true,
      enableVxLan: true,
      vxLanTunnels: [{
        id: 'mocked_tunnel',
        name: 'tunnelProfile1',
        mtuType: MtuTypeEnum.MANUAL,
        mtuSize: 1450,
        forceFragmentation: true,
        ageTimeMinutes: 20,
        personalIdentityNetworkIds: ['mocked_pin_1'],
        sdLanIds: [],
        networkIds: ['mocked_network_1'],
        type: TunnelTypeEnum.VXLAN,
        tags: []
      }]
    })

    render(
      <Provider>
        <Form>
          <NetworkControlTab wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const clientIsolationContainer = screen.getByText(/client isolation/i)
    expect(within(clientIsolationContainer).getByRole('switch')).toBeDisabled()
    await screen.findByText('Tunnel Profile')
    const tunnelProfileLabel = await screen.findByText('Tunnel Profile')
    // because TunnelProfile is not binding by formItem name, we could not access it via getByRole with name
    // eslint-disable-next-line testing-library/no-node-access
    const tunnelProfileFormItem = tunnelProfileLabel.closest('.ant-form-item-row')
    // eslint-disable-next-line max-len
    const tunnelProfileDropdown = within(tunnelProfileFormItem as HTMLElement).getByRole('combobox')
    expect(tunnelProfileDropdown).toBeDisabled()
    // eslint-disable-next-line max-len
    await screen.findByText(/All networks under the same Network Segmentation share the same tunnel profile/i)
  })
})
