import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  BasicServiceSetPriorityEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  OpenWlanAdvancedCustomization,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { cleanup, fireEvent, render, screen } from '@acx-ui/test-utils'

import NetworkFormContext, { NetworkFormContextType } from '../../NetworkFormContext'
import { NetworkMoreSettingsForm }                    from '../NetworkMoreSettingsForm'

import { NetworkingTab } from '.'



const mockWlanData = {
  name: 'test',
  type: 'open',
  isCloudpathEnabled: false,
  venues: [],
  wlan: {
    advancedCustomization: {
      bssPriority: BasicServiceSetPriorityEnum.LOW,
      enableTransientClientManagement: true,
      enableOptimizedConnectivityExperience: true,
      enableAdditionalRegulatoryDomains: true
    } as OpenWlanAdvancedCustomization
  }
} as NetworkSaveData



jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  hasVxLanTunnelProfile: jest.fn().mockReturnValue(false)
}))

const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
const mockContextData = { editMode: true, data: mockWlanData } as NetworkFormContextType

describe.skip('Network More settings - Networking Tab', () => {

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
        it('WPA23Mixed', async () => {
          // eslint-disable-next-line max-len
          const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA23Mixed } } as NetworkSaveData
          for (const networkType in testNetworkTypes) {
            jest.mocked(useIsSplitOn).mockReturnValue(false)
            // eslint-disable-next-line max-len
            const mockContextData = { editMode: true, data: { type: NetworkTypeEnum[networkType as keyof typeof NetworkTypeEnum] } } as NetworkFormContextType
            render(MockedMoreSettingsForm(mockWlanData, mockContextData), { route: { params } })

            const tabs = await screen.findAllByRole('tab')
            const networkingTab = tabs[3]
            await userEvent.click(networkingTab)

            expect(screen.queryByTestId('enableFastRoaming-full-block')).toBeNull()
            cleanup()
          }
        })

        it('WPA3', async () => {
          // eslint-disable-next-line max-len
          const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA23Mixed } } as NetworkSaveData
          for (const networkType in testNetworkTypes) {
            jest.mocked(useIsSplitOn).mockReturnValue(false)
            // eslint-disable-next-line max-len
            const mockContextData = { editMode: true, data: { type: NetworkTypeEnum[networkType as keyof typeof NetworkTypeEnum] } } as NetworkFormContextType
            render(MockedMoreSettingsForm(mockWlanData, mockContextData), { route: { params } })

            const tabs = await screen.findAllByRole('tab')
            const networkingTab = tabs[3]
            await userEvent.click(networkingTab)

            expect(screen.queryByTestId('enableFastRoaming-full-block')).toBeNull()
            cleanup()
          }
        })
      })

      describe('Test case under feature toggle is enabled.', () => {
        it('WPA23Mixed', async () => {
          jest.mocked(useIsSplitOn).mockReturnValue(true)
          // eslint-disable-next-line max-len
          const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA23Mixed } } as NetworkSaveData

          for (const networkType in testNetworkTypes) {
            // eslint-disable-next-line max-len
            const mockContextData = { editMode: true, data: { type: NetworkTypeEnum[networkType as keyof typeof NetworkTypeEnum] } } as NetworkFormContextType
            render(MockedMoreSettingsForm(mockWlanData, mockContextData), { route: { params } })

            const tabs = await screen.findAllByRole('tab')
            const networkingTab = tabs[3]
            await userEvent.click(networkingTab)

            expect(screen.getByTestId('enableFastRoaming-full-block')).toBeVisible()
            cleanup()
          }
        })

        it('WPA3', async () => {
          jest.mocked(useIsSplitOn).mockReturnValue(true)
          // eslint-disable-next-line max-len
          const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA23Mixed } } as NetworkSaveData

          for (const networkType in testNetworkTypes) {
            // eslint-disable-next-line max-len
            const mockContextData = { editMode: true, data: { type: NetworkTypeEnum[networkType as keyof typeof NetworkTypeEnum] } } as NetworkFormContextType
            render(MockedMoreSettingsForm(mockWlanData, mockContextData), { route: { params } })

            const tabs = await screen.findAllByRole('tab')
            const networkingTab = tabs[3]
            await userEvent.click(networkingTab)

            expect(screen.getByTestId('enableFastRoaming-full-block')).toBeVisible()
            cleanup()
          }
        })
      })

      describe('Test case for visibility of Mobility Domain Id', () => {
        it('Toggle enabled', async () => {
          jest.mocked(useIsSplitOn).mockReturnValue(true)
          const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA3 } } as NetworkSaveData
          // eslint-disable-next-line max-len
          const mockContextData = { editMode: true, data: { type: NetworkTypeEnum.CAPTIVEPORTAL } } as NetworkFormContextType
          render(MockedMoreSettingsForm(mockWlanData, mockContextData), { route: { params } })

          const tabs = await screen.findAllByRole('tab')
          const networkingTab = tabs[3]
          await userEvent.click(networkingTab)

          const checkbox = screen.getByTestId('enableFastRoaming')
          expect(checkbox).toBeVisible()
          fireEvent.click(checkbox)
          expect(screen.getByTestId('mobilityDomainId-full-block')).toBeVisible()
          fireEvent.click(checkbox)
          expect(screen.queryByTestId('mobilityDomainId-full-block')).toBeNull()
        })

        it('Toggle disabled', async () => {
          jest.mocked(useIsSplitOn).mockReturnValue(false)
          const mockWlanData = { wlan: { wlanSecurity: WlanSecurityEnum.WPA3 } } as NetworkSaveData
          // eslint-disable-next-line max-len
          const mockContextData = { editMode: true, data: { type: NetworkTypeEnum.CAPTIVEPORTAL } } as NetworkFormContextType

          render(MockedMoreSettingsForm(mockWlanData, mockContextData), { route: { params } })

          const tabs = await screen.findAllByRole('tab')
          const networkingTab = tabs[3]
          await userEvent.click(networkingTab)

          const checkbox = screen.queryByTestId('enableFastRoaming')
          expect(checkbox).toBeNull()
          expect(screen.queryByTestId('mobilityDomainId-full-block')).toBeNull()
        })
      })
    })
  })

  it('Test case for Basic Service Set Radio Group', async ()=> {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return ff === Features.WIFI_EDA_BSS_PRIORITY_TOGGLE ? true : false
    })

    render(MockedMoreSettingsForm(mockWlanData, mockContextData), { route: { params } })
    const tabs = await screen.findAllByRole('tab')
    const networkingTab = tabs[3]
    await userEvent.click(networkingTab)

    expect(screen.getByTestId('BSS-Radio-Group')).toBeVisible()
    expect(screen.getByTestId('BSS-Radio-LOW')).toBeChecked()
  })

  it('Test case for 80211D additional regulatory domains', async ()=> {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return ff === Features.ADDITIONAL_REGULATORY_DOMAINS_TOGGLE ? true : false
    })

    render(MockedMoreSettingsForm(mockWlanData, mockContextData), { route: { params } })
    const tabs = await screen.findAllByRole('tab')
    const networkingTab = tabs[3]
    await userEvent.click(networkingTab)

    expect(screen.getByTestId('enable-additional-regulatory-domains-80211d')).toBeVisible()
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

export function MockedNetworkingTab (
  wlanData: NetworkSaveData,
  networkFormContext: NetworkFormContextType
) {
  return (
    <Provider>
      <NetworkFormContext.Provider value={networkFormContext}>
        <Form>
          <NetworkingTab wlanData={wlanData} />
        </Form>
      </NetworkFormContext.Provider>
    </Provider>
  )
}
