import { ClientIsolationVenue, NetworkSaveData, NetworkTypeEnum, NetworkVenue, RadioEnum } from '@acx-ui/rc/utils'

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
      // eslint-disable-next-line max-len
      expect(transferMoreSettingsToSave(incomingData, incomingData)).not.toHaveProperty('dpskServiceProfileId')
    })
  })
})
