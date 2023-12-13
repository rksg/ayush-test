import { ClientIsolationVenue, DpskWlanAdvancedCustomization, NetworkSaveData, NetworkTypeEnum, NetworkVenue, RadioEnum, TunnelTypeEnum } from '@acx-ui/rc/utils'

import { updateClientIsolationAllowlist, tranferSettingsToSave, transferMoreSettingsToSave } from './parser'

describe('NetworkForm parser', () => {
  describe('updateClientIsolationAllowlist', () => {
    let mockedNetworkVenue: NetworkVenue
    let mockedClientIsolationList: ClientIsolationVenue[]
    let incomingData

    beforeEach(() => {
      mockedNetworkVenue = {
        allApGroupsRadio: RadioEnum.Both,
        venueId: '6de6a5239a1441cfb9c7fde93aa613fe'
      }

      mockedClientIsolationList = [{
        venueId: '6de6a5239a1441cfb9c7fde93aa613fe'
      }]
    })

    it('verify the empty NetworkSaveData', () => {
      incomingData = {}
      expect(updateClientIsolationAllowlist(incomingData)).toEqual(incomingData)
    })

    it('verify the empty client isolation allow list', () => {
      incomingData = {
        wlan: {
          advancedCustomization: {
            clientIsolationAllowlistEnabled: true,
            clientIsolationVenues: []
          }
        },
        venues: [mockedNetworkVenue]
      }
      expect(updateClientIsolationAllowlist(incomingData as unknown as NetworkSaveData)).toEqual({
        wlan: {
          advancedCustomization: {}
        },
        venues: [mockedNetworkVenue]
      })
    })

    it('verify the client isolation allow list', () => {
      incomingData = {
        wlan: {
          advancedCustomization: {
            clientIsolationAllowlistEnabled: true,
            clientIsolationVenues: mockedClientIsolationList
          }
        },
        venues: [mockedNetworkVenue]
      }
      expect(updateClientIsolationAllowlist(incomingData as unknown as NetworkSaveData)).toEqual({
        wlan: {
          advancedCustomization: {}
        },
        venues: [
          {
            ...mockedNetworkVenue,
            clientIsolationAllowlistId: mockedClientIsolationList[0].clientIsolationAllowlistId
          }
        ]
      })
    })

    it('verify the client isolation allow list disabled', () => {
      incomingData = {
        wlan: {
          advancedCustomization: {
            clientIsolationAllowlistEnabled: false,
            clientIsolationVenues: []
          }
        },
        venues: [
          {
            ...mockedNetworkVenue,
            clientIsolationAllowlistId: mockedClientIsolationList[0].clientIsolationAllowlistId
          }
        ]
      }
      expect(updateClientIsolationAllowlist(incomingData as unknown as NetworkSaveData)).toEqual({
        wlan: {
          advancedCustomization: {}
        },
        venues: [mockedNetworkVenue]
      })
    })
  })

  describe('transfer DPSK settings', () => {
    it('verify the empty DPSK profile', () => {
      const incomingData: NetworkSaveData = {
        type: NetworkTypeEnum.DPSK,
        dpskServiceProfileId: ''
      }

      expect(tranferSettingsToSave(incomingData, false)).not.toHaveProperty('dpskServiceProfileId')
      const moreSettingData = transferMoreSettingsToSave(incomingData, incomingData)
      expect(moreSettingData).not.toHaveProperty('dpskServiceProfileId')
      // eslint-disable-next-line max-len
      expect(moreSettingData.wlan?.advancedCustomization).not.toHaveProperty('enableAaaVlanOverride')

    })

    it('should set `enableAaaVlanOverride` to false when tunnel type is VxLan', () => {
      const incomingData: NetworkSaveData = {
        type: NetworkTypeEnum.DPSK,
        dpskServiceProfileId: ''
      }
      const tunnelInfo = {
        enableVxLan: true,
        tunnelType: TunnelTypeEnum.VXLAN
      }

      const moreSettingData = transferMoreSettingsToSave(incomingData, incomingData, tunnelInfo)
      expect(moreSettingData.wlan?.advancedCustomization).toHaveProperty('enableAaaVlanOverride')
      // eslint-disable-next-line max-len
      expect((moreSettingData.wlan?.advancedCustomization as DpskWlanAdvancedCustomization)?.enableAaaVlanOverride).toBe(false)
    })
  })

  describe('transfer AccessControl settings', () => {
    it('verify the AccessControlSet profile and subprofile settings', () => {
      const incomingData: NetworkSaveData = {
        type: NetworkTypeEnum.OPEN,
        accessControlProfileEnable: true,
        wlan: {
          advancedCustomization: {
            accessControlProfileId: 'testId',
            devicePolicyId: 'devicePolicyId'
          }
        } as unknown as NetworkSaveData
      }

      // eslint-disable-next-line max-len
      expect(transferMoreSettingsToSave(incomingData, incomingData)).not.toHaveProperty('devicePolicy')
    })
  })
})
