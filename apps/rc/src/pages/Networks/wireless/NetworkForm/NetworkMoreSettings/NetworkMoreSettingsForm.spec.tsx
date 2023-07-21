import '@testing-library/jest-dom'

import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  AccessControlUrls,
  CommonUrlsInfo,
  NetworkSaveData,
  NetworkTypeEnum,
  WlanSecurityEnum,
  BasicServiceSetPriorityEnum,
  OpenWlanAdvancedCustomization,
  DpskWlanAdvancedCustomization,
  TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, within, render, screen, cleanup, fireEvent } from '@acx-ui/test-utils'

import { mockedTunnelProfileViewData }                                     from '../../../../Policies/TunnelProfile/__tests__/fixtures'
import { devicePolicyListResponse, externalProviders, policyListResponse } from '../__tests__/fixtures'
import NetworkFormContext, { NetworkFormContextType }                      from '../NetworkFormContext'
import { hasVxLanTunnelProfile }                                           from '../utils'

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

const mockVxlanEnableWlanData = {
  name: 'testVxlanDisplay',
  type: 'dpsk',
  wlan: {
    advancedCustomization: {
      tunnelProfileId: 'tunnelProfileId1'
    } as DpskWlanAdvancedCustomization
  }
} as NetworkSaveData

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  hasVxLanTunnelProfile: jest.fn().mockReturnValue(false)
}))

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

    const ofdmCheckbox = screen.getByTestId('enableOfdmOnly')
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

  it('should not display message when Vxlan is disabled', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <MoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const tunnelProfileLabel = screen.queryByText('Tunnel Profile')
    expect(tunnelProfileLabel).toBeNull()

    // eslint-disable-next-line max-len
    const vlanRemindingMsg = screen.queryByText('Not able to modify when the network enables network segmentation service')
    expect(vlanRemindingMsg).toBeNull()

    // eslint-disable-next-line max-len
    const tunnelProfileRemindingMsg = screen.queryByText('All networks under the same Network Segmentation', { exact: false })
    expect(tunnelProfileRemindingMsg).toBeNull()
  })

  it('when vxlan enalbe, should disable related fields', async () => {
    jest.mocked(hasVxLanTunnelProfile).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <MoreSettingsForm wlanData={mockVxlanEnableWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const vlanPool = screen.getByText(/vlan pooling:/i)
    expect(within(vlanPool).getByRole('switch')).toBeDisabled()

    expect(screen.getByRole('spinbutton', { name: 'VLAN ID' })).toBeDisabled()

    const proxyARP = screen.getByText(/Proxy ARP:/i)
    expect(within(proxyARP).getByRole('switch')).toBeDisabled()

    const clientIsolation = screen.getByText(/Client Isolation:/i)
    expect(within(clientIsolation).getByRole('switch')).toBeDisabled()

    const tunnelProfileCombobox = screen.getByRole('combobox', { name: 'Tunnel Profile' })
    expect(tunnelProfileCombobox).toBeDisabled()

    // eslint-disable-next-line max-len
    const vlanRemindingMsg = screen.getByText('Not able to modify when the network enables network segmentation service')
    expect(vlanRemindingMsg).toBeVisible()

    // eslint-disable-next-line max-len
    const tunnelProfileRemindingMsg = screen.getByText('All networks under the same Network Segmentation', { exact: false })
    expect(tunnelProfileRemindingMsg).toBeVisible()
  })

  it('Test case for Multicast Filter', async ()=> {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockContextData = { editMode: true, data: mockWlanData } as NetworkFormContextType
    render(MockedMoreSettingsForm(mockWlanData, mockContextData),{ route: { params } })
    expect(await screen.findByTestId('multicast-filter-enabled')).toBeVisible()
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
