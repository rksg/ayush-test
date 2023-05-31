import '@testing-library/jest-dom'

import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                                                                                                            from '@acx-ui/feature-toggle'
import { AccessControlUrls, CommonUrlsInfo, NetworkSaveData, NetworkTypeEnum, WlanSecurityEnum, BasicServiceSetPriorityEnum, OpenWlanAdvancedCustomization, GuestNetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                                                from '@acx-ui/store'
import { mockServer, within, render, screen, cleanup, fireEvent }                                                                                                                  from '@acx-ui/test-utils'

import { devicePolicyListResponse, externalProviders, policyListResponse } from '../__tests__/fixtures'
import NetworkFormContext, { NetworkFormContextType }                      from '../NetworkFormContext'
import { hasAccountingRadius, hasAuthRadius }                              from '../utils'

import { MoreSettingsForm, NetworkMoreSettingsForm } from './NetworkMoreSettingsForm'


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
      rest.get(CommonUrlsInfo.getVlanPoolList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(AccessControlUrls.getAccessControlProfileList.url,
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
  it('Test case for Basic Service Set Radio Group', async ()=> {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockContextData = { editMode: true, data: mockWlanData } as NetworkFormContextType
    render(MockedMoreSettingsForm(mockWlanData, mockContextData),{ route: { params } })
    expect(screen.getByTestId('BSS-Radio-Group')).toBeVisible()
    expect(screen.getByTestId('BSS-Radio-LOW')).toBeChecked()
  })

  it('Test network types for show the RADIUS Options settings', () => {
    // AAA network type
    const aaaData = { type: NetworkTypeEnum.AAA }
    const aaaWlanData = { }
    expect(hasAuthRadius(aaaData, aaaWlanData)).toBeTruthy()

    // open/psk network type
    const openData = { type: NetworkTypeEnum.OPEN }
    const pskData = { type: NetworkTypeEnum.PSK }
    let wlanData = {
      wlan: {
        macAddressAuthentication: true,
        isMacRegistrationList: true
      }
    }
    expect(hasAuthRadius(openData, wlanData)).toBeFalsy()
    expect(hasAuthRadius(pskData, wlanData)).toBeFalsy()

    wlanData = {
      wlan: {
        macAddressAuthentication: false,
        isMacRegistrationList: false
      }
    }
    expect(hasAuthRadius(openData, wlanData)).toBeFalsy()
    expect(hasAuthRadius(pskData, wlanData)).toBeFalsy()

    wlanData = {
      wlan: {
        macAddressAuthentication: true,
        isMacRegistrationList: false
      }
    }
    expect(hasAuthRadius(openData, wlanData)).toBeTruthy()
    expect(hasAuthRadius(pskData, wlanData)).toBeTruthy()

    // dpsk network type
    const dpskData = { type: NetworkTypeEnum.DPSK }
    let dpskWlanData = { isCloudpathEnabled: true }
    expect(hasAuthRadius(dpskData, dpskWlanData)).toBeTruthy()
    dpskWlanData = { isCloudpathEnabled: false }
    expect(hasAuthRadius(dpskData, dpskWlanData)).toBeFalsy()

    // captive portal network type
    let guestData = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.Cloudpath
      }
    }
    expect(hasAuthRadius(guestData, {})).toBeTruthy()

    guestData = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.WISPr
      }
    }

    const guestWlanData = {
      guestPortal: {
        wisprPage: {
          customExternalProvider: true
        }
      }
    }

    expect(hasAuthRadius(guestData, guestWlanData)).toBeTruthy()

    expect(hasAuthRadius({ }, {})).toBeFalsy()
  })

  // eslint-disable-next-line max-len
  it('Test network settings for show the SingleSessionIdAccounting of the RADIUS Options', () => {
    let wlanData = { }

    // AAA/open/psk/dpsk network type
    let aaaData = { type: NetworkTypeEnum.AAA, enableAccountingService: false }
    let openData = { type: NetworkTypeEnum.OPEN, enableAccountingService: false }
    let pskData = { type: NetworkTypeEnum.PSK, enableAccountingService: false }
    expect(hasAccountingRadius(aaaData, wlanData)).toBeFalsy()
    expect(hasAccountingRadius(openData, wlanData)).toBeFalsy()
    expect(hasAccountingRadius(pskData, wlanData)).toBeFalsy()

    aaaData = { type: NetworkTypeEnum.AAA, enableAccountingService: true }
    openData = { type: NetworkTypeEnum.OPEN, enableAccountingService: true }
    pskData = { type: NetworkTypeEnum.PSK, enableAccountingService: true }
    expect(hasAccountingRadius(aaaData, wlanData)).toBeTruthy()
    expect(hasAccountingRadius(openData, wlanData)).toBeTruthy()
    expect(hasAccountingRadius(pskData, wlanData)).toBeTruthy()


    // captive portal network type
    let guestData = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      enableAccountingService: false,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.WISPr
      }
    }

    let guestWlanData = {
      guestPortal: {
        wisprPage: {
          customExternalProvider: false,
          externalProviderName: 'Height8'
        }
      }
    }
    expect(hasAccountingRadius(guestData, guestWlanData)).toBeFalsy()

    guestWlanData = {
      guestPortal: {
        wisprPage: {
          customExternalProvider: false,
          externalProviderName: 'Aislelabs'
        }
      }
    }
    expect(hasAccountingRadius(guestData, guestWlanData)).toBeTruthy()

    guestWlanData = {
      guestPortal: {
        wisprPage: {
          customExternalProvider: true,
          externalProviderName: 'Other Provider'
        }
      }
    }

    expect(hasAccountingRadius(guestData, guestWlanData)).toBeFalsy()


    guestData = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      enableAccountingService: true,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.WISPr
      }
    }
    expect(hasAccountingRadius(guestData, guestWlanData)).toBeTruthy()

    expect(hasAccountingRadius({ }, {})).toBeFalsy()
  })

  describe('Test case for Fast BSS Transition and Mobility Domain ID', () => {
    beforeAll(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })
    describe('Test case for visibility of Fast BSS Transition and Mobility Domain Id', () => {
      const testNetworkTypes = [
        NetworkTypeEnum.CAPTIVEPORTAL,
        NetworkTypeEnum.PSK
      ]
      describe('Test case under feature toggle is disabled.', () => {
        it('WPA23Mixed', () => {
          // eslint-disable-next-line max-len
          const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA23Mixed } } as NetworkSaveData
          const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
          for (const networkType in testNetworkTypes) {
            jest.mocked(useIsSplitOn).mockReturnValue(false)
            // eslint-disable-next-line max-len
            const mockContextData = { editMode: true, data: { type: NetworkTypeEnum[networkType as keyof typeof NetworkTypeEnum] } } as NetworkFormContextType
            render(MockedMoreSettingsForm(mockWlanData, mockContextData) ,{ route: { params } })
            expect(screen.queryByTestId('enableFastRoaming-full-block')).toBeNull()
            cleanup()
          }
        })
        it('WPA3', () => {
          // eslint-disable-next-line max-len
          const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA23Mixed } } as NetworkSaveData
          const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
          for (const networkType in testNetworkTypes) {
            jest.mocked(useIsSplitOn).mockReturnValue(false)
            // eslint-disable-next-line max-len
            const mockContextData = { editMode: true, data: { type: NetworkTypeEnum[networkType as keyof typeof NetworkTypeEnum] } } as NetworkFormContextType
            render(MockedMoreSettingsForm(mockWlanData, mockContextData) ,{ route: { params } })
            expect(screen.queryByTestId('enableFastRoaming-full-block')).toBeNull()
            cleanup()
          }
        })
      })
      describe('Test case under feature toggle is enabled.', () => {
        it('WPA23Mixed', () => {
          jest.mocked(useIsSplitOn).mockReturnValue(true)
          // eslint-disable-next-line max-len
          const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA23Mixed } } as NetworkSaveData
          const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
          for (const networkType in testNetworkTypes) {
            // eslint-disable-next-line max-len
            const mockContextData = { editMode: true, data: { type: NetworkTypeEnum[networkType as keyof typeof NetworkTypeEnum] } } as NetworkFormContextType
            render(MockedMoreSettingsForm(mockWlanData, mockContextData) ,{ route: { params } })
            expect(screen.getByTestId('enableFastRoaming-full-block')).toBeVisible()
            cleanup()
          }
        })
        it('WPA3', () => {
          jest.mocked(useIsSplitOn).mockReturnValue(true)
          // eslint-disable-next-line max-len
          const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA23Mixed } } as NetworkSaveData
          const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
          for (const networkType in testNetworkTypes) {
            // eslint-disable-next-line max-len
            const mockContextData = { editMode: true, data: { type: NetworkTypeEnum[networkType as keyof typeof NetworkTypeEnum] } } as NetworkFormContextType
            render(MockedMoreSettingsForm(mockWlanData, mockContextData) ,{ route: { params } })
            expect(screen.getByTestId('enableFastRoaming-full-block')).toBeVisible()
            cleanup()
          }
        })
      })
      describe('Test case for visibility of Mobility Domain Id', () => {
        it('Toggle enabled', () => {
          jest.mocked(useIsSplitOn).mockReturnValue(true)
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
        it('Toggle disabled', () => {
          jest.mocked(useIsSplitOn).mockReturnValue(false)
          const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA3 } } as NetworkSaveData
          // eslint-disable-next-line max-len
          const mockContextData = { editMode: true, data: { type: NetworkTypeEnum.CAPTIVEPORTAL } } as NetworkFormContextType
          const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
          render(MockedMoreSettingsForm(mockWlanData, mockContextData) ,{ route: { params } })
          const checkbox = screen.queryByTestId('enableFastRoaming')
          expect(checkbox).toBeNull()
          expect(screen.queryByTestId('mobilityDomainId-full-block')).toBeNull()
        })
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
          <NetworkMoreSettingsForm wlanData={wlanData} />
        </Form>
      </NetworkFormContext.Provider>
    </Provider>
  )
}
