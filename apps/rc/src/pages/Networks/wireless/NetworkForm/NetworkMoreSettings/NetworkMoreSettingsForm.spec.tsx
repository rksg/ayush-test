import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                                       from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, NetworkSaveData, NetworkTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { Provider }                                                           from '@acx-ui/store'
import { mockServer, within, render, screen, cleanup, fireEvent }             from '@acx-ui/test-utils'

import { externalProviders, policyListResponse }      from '../__tests__/fixtures'
import NetworkFormContext, { NetworkFormContextType } from '../NetworkFormContext'

import { MoreSettingsForm, NetworkMoreSettingsForm, enableBSSRules } from './NetworkMoreSettingsForm'

const mockWlanData = {
  name: 'test',
  type: 'open',
  isCloudpathEnabled: false,
  venues: []
} as NetworkSaveData

describe('NetworkMoreSettingsForm', () => {
  beforeEach(() => {
    const devicePolicyResponse = [{
      data: [{
        id: 'e3ea3749907f4feb95e9b46fe69aae0b',
        name: 'p1',
        rulesCount: 1,
        networksCount: 0
      }],
      fields: [
        'name',
        'id'],
      totalCount: 1,
      totalPages: 1,
      page: 1
    }]

    mockServer.use(
      rest.post(CommonUrlsInfo.getDevicePolicyList.url,
        (req, res, ctx) => res(ctx.json(devicePolicyResponse))),
      rest.post(CommonUrlsInfo.getL2AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(CommonUrlsInfo.getL3AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(CommonUrlsInfo.getApplicationPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(CommonUrlsInfo.getWifiCallingProfileList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(CommonUrlsInfo.getVlanPoolList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(CommonUrlsInfo.getAccessControlProfileList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(CommonUrlsInfo.getExternalProviders.url,
        (_, res, ctx) => res(ctx.json(externalProviders)))
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
  })

  it('should visible VLAN pooling', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <MoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/vlan pooling:/i)
    expect(within(view).getByRole('switch')).toBeDisabled()
    // await userEvent.click(within(view).getByRole('switch'))
    // await userEvent.click(screen.getByRole('combobox', {
    //   name: /vlan pool:/i
    // }))
    // expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  it('after click Client Isolation', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <MoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/client isolation:/i)
    await userEvent.click(within(view).getByRole('switch'))

    expect(screen.getByText(/automatic support for vrrp\/hsrp:/i)).toBeVisible()
    expect(screen.getByText(/client isolation allowlist by venue:/i)).toBeVisible()
  })

  it('after click Anti-spoofing', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <MoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/anti\-spoofing:/i)
    await userEvent.click(within(view).getByRole('switch'))

    expect(screen.getByText(/arp request rate limit/i)).toBeVisible()
    expect(screen.getByText(/dhcp request rate limit/i)).toBeVisible()
  })

  xit('after click Access Control', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <MoreSettingsForm wlanData={mockWlanData} />
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


  it('aaa type wlan', async () => {
    const mockDpskWlanData = {
      name: 'test',
      type: 'aaa',
      isCloudpathEnabled: false,
      venues: []
    } as NetworkSaveData
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <MoreSettingsForm wlanData={mockDpskWlanData} />
        </Form>
      </Provider>,
      { route: { params } })


  })

  it('Adjust BBS Min Rate value', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <MoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const mgmtTxRateSelect = screen.getByTestId('mgmtTxRateSelect')
    expect(within(mgmtTxRateSelect).getByText(/6 Mbps/i)).toBeVisible()

    const ofdmCheckbox = screen.getByRole('checkbox', {
      name: /enable ofdm only \(disable 802\.11b\)/i
    })
    await userEvent.click(ofdmCheckbox)

    await userEvent.click(screen.getByText(/none/i))
    await userEvent.click(screen.getByText(/5.5 Mbps/i))
    expect(within(mgmtTxRateSelect).getByText(/5.5 mbps/i)).toBeVisible()
  })
  describe('Test case for Fast BSS Transition and Mobility Domain ID', () => {

    describe('Test case for enableBSSRules.shouldBeEnabled()', () => {
      it('test case that should return true', () => {
        // eslint-disable-next-line max-len
        expect(enableBSSRules.shouldBeEnabled(WlanSecurityEnum.WPA2Personal, NetworkTypeEnum.AAA, false)).toBeTruthy()
        // eslint-disable-next-line max-len
        expect(enableBSSRules.shouldBeEnabled(WlanSecurityEnum.WPA23Mixed, NetworkTypeEnum.PSK, true)).toBeTruthy()
        // eslint-disable-next-line max-len
        expect(enableBSSRules.shouldBeEnabled(WlanSecurityEnum.WPA3, NetworkTypeEnum.AAA, true)).toBeTruthy()
      })
      it('test case that should return false', () => {
        // eslint-disable-next-line max-len
        expect(enableBSSRules.shouldBeEnabled(WlanSecurityEnum.WPA2Personal, NetworkTypeEnum.PSK, false)).toBeFalsy()
        // eslint-disable-next-line max-len
        expect(enableBSSRules.shouldBeEnabled(WlanSecurityEnum.WPA23Mixed, NetworkTypeEnum.AAA, true)).toBeFalsy()
        // eslint-disable-next-line max-len
        expect(enableBSSRules.shouldBeEnabled(WlanSecurityEnum.WPA3, NetworkTypeEnum.DPSK, true)).toBeFalsy()
        // eslint-disable-next-line max-len
        expect(enableBSSRules.shouldBeEnabled(WlanSecurityEnum.WEP, NetworkTypeEnum.DPSK, true)).toBeFalsy()
      })
    })
    describe('Test case for visibility of Fast BSS Transition and Mobility Domain Id', () => {

      beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {})
      })
      it('Test case under feature toggle is disabled.', () => {
        jest.mocked(useIsSplitOn).mockReturnValue(false)
        for (let networkType in NetworkTypeEnum) {
          for (let wlanSecurity in WlanSecurityEnum) {
            const castedWlanSecurity = wlanSecurity as WlanSecurityEnum
            const castedNetworkType = NetworkTypeEnum[networkType as keyof typeof NetworkTypeEnum]
            const mockWlanData = { wlan: { wlanSecurity: castedWlanSecurity } } as NetworkSaveData
            // eslint-disable-next-line max-len
            const mockContextData = { editMode: true, data: { type: castedNetworkType } } as NetworkFormContextType
            const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
            render(MockedMoreSettingsForm(mockWlanData, mockContextData) ,{ route: { params } })
            // eslint-disable-next-line max-len
            const isEnabled = enableBSSRules.shouldBeEnabled(castedWlanSecurity, castedNetworkType, false)
            const result = {
              BSSfullblock: screen.queryByTestId('enableFastRoaming-full-block') ? true : false,
              BSSinput: screen.queryByTestId('enableFastRoaming') ? true : false
            }
            expect(result).toEqual({
              BSSfullblock: isEnabled,
              BSSinput: isEnabled
            })
            cleanup()
          }
        }
      })
      it('Test case under feature toggle is enabled.', () => {
        jest.mocked(useIsSplitOn).mockReturnValue(true)
        for (let networkType in NetworkTypeEnum) {
          for (let wlanSecurity in WlanSecurityEnum) {
            const castedWlanSecurity = wlanSecurity as WlanSecurityEnum
            const castedNetworkType = NetworkTypeEnum[networkType as keyof typeof NetworkTypeEnum]
            const mockWlanData = { wlan: { wlanSecurity: castedWlanSecurity } } as NetworkSaveData
            // eslint-disable-next-line max-len
            const mockContextData = { editMode: true, data: { type: castedNetworkType } } as NetworkFormContextType
            const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
            render(MockedMoreSettingsForm(mockWlanData, mockContextData) ,{ route: { params } })
            // eslint-disable-next-line max-len
            const isEnabled = enableBSSRules.shouldBeEnabled(castedWlanSecurity, castedNetworkType, true)
            const result = {
              BSSfullblock: screen.queryByTestId('enableFastRoaming-full-block') ? true : false,
              BSSinput: screen.queryByTestId('enableFastRoaming') ? true : false
            }
            expect(result).toEqual({
              BSSfullblock: isEnabled,
              BSSinput: isEnabled
            })
            cleanup()
          }
        }
      })
      it('Test case for visibility of Mobility Domain Id', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {})
        const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA3 } } as NetworkSaveData
        // eslint-disable-next-line max-len
        const mockContextData = { editMode: true, data: { type: NetworkTypeEnum.CAPTIVEPORTAL } } as NetworkFormContextType
        const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
        render(MockedMoreSettingsForm(mockWlanData, mockContextData) ,{ route: { params } })
        const checkbox = screen.getByTestId('enableFastRoaming')
        expect(checkbox).toBeVisible()
        fireEvent.click(checkbox)
        expect(screen.getByTestId('mobilityDomainId-full-block')).toBeVisible()
        fireEvent.click(checkbox)
        expect(screen.queryByTestId('mobilityDomainId-full-block')).toBeNull()
      })
    })
  })
})
// eslint-disable-next-line max-len
export function MockedMoreSettingsForm (wlanData: NetworkSaveData, networkFormContext: NetworkFormContextType) {
  return (
    <Provider>
      <NetworkFormContext.Provider value={networkFormContext}>
        <Form>
          <MoreSettingsForm wlanData={wlanData} />
        </Form>
      </NetworkFormContext.Provider>
    </Provider>
  )
}