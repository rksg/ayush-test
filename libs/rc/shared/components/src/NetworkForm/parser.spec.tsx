import {
  ClientIsolationVenue,
  DpskWlanAdvancedCustomization,
  MaxRateEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  NetworkVenue,
  RadioEnum,
  TunnelTypeEnum, WlanSecurityEnum
} from '@acx-ui/rc/utils'

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
      expect(moreSettingData.wlan?.advancedCustomization).toHaveProperty('enableAaaVlanOverride')

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

    it('should set useDpskService correctly when enabling/disabling DPSK service profile', () => {
      expect(tranferSettingsToSave({
        type: NetworkTypeEnum.DPSK,
        dpskServiceProfileId: ''
      }, false)).toHaveProperty('useDpskService', false)

      expect(tranferSettingsToSave({
        type: NetworkTypeEnum.DPSK,
        dpskServiceProfileId: 'DPSK_ID_12345'
      }, false)).toHaveProperty('useDpskService', true)
    })
  })

  describe('transfer NetworkMoreSettings', () => {
    it('verify the AccessControlSet profile and subprofile settings with dnsProxyEnabled', () => {
      const incomingData: NetworkSaveData = {
        type: NetworkTypeEnum.OPEN,
        accessControlProfileEnable: true,
        wlan: {
          advancedCustomization: {
            accessControlProfileId: 'testId',
            l2AclPolicyId: 'removeL2Id',
            l3AclPolicyId: 'removeL3Id',
            l2AclEnable: false,
            l3AclEnable: false,
            devicePolicyId: 'devicePolicyId',
            dnsProxyEnabled: true,
            dnsProxyRules: [{
              domainName: 'test.com',
              ipList: ['192.168.0.100']
            }]
          }
        }
      } as unknown as NetworkSaveData

      // eslint-disable-next-line max-len
      expect(transferMoreSettingsToSave(incomingData, incomingData)).not.toHaveProperty('devicePolicy')
    })

    it('verify the loadControlForm with maxRate unlimited', () => {
      const incomingData: NetworkSaveData = {
        type: NetworkTypeEnum.OPEN,
        accessControlProfileEnable: true,
        wlan: {
          advancedCustomization: {
            dnsProxyEnabled: true,
            dnsProxyRules: [{
              domainName: 'test.com',
              ipList: ['192.168.0.100']
            }]
          }
        },
        maxRate: MaxRateEnum.UNLIMITED
      } as unknown as NetworkSaveData

      expect(transferMoreSettingsToSave(incomingData, incomingData))
        .toHaveProperty(['wlan', 'advancedCustomization', 'totalUplinkRateLimiting'])
    })

    it('verify the loadControlForm with maxRate pre-ap', () => {
      const incomingData: NetworkSaveData = {
        type: NetworkTypeEnum.OPEN,
        accessControlProfileEnable: true,
        wlan: {
          advancedCustomization: {
            dnsProxyEnabled: true,
            dnsProxyRules: [{
              domainName: 'test.com',
              ipList: ['192.168.0.100']
            }]
          }
        },
        maxRate: MaxRateEnum.PER_AP,
        totalUplinkLimited: false,
        totalDownlinkLimited: false
      } as unknown as NetworkSaveData

      expect(transferMoreSettingsToSave(incomingData, incomingData))
        .toHaveProperty(['wlan', 'advancedCustomization', 'totalUplinkRateLimiting'])
    })
  })

  describe('transfer AAASetting data', () => {
    it('verify the AAASetting data', () => {
      const incomingData: NetworkSaveData = {
        type: NetworkTypeEnum.AAA,
        authRadiusId: '',
        authRadius: {
          primary: {
            ip: '1.1.1.1'
          }
        },
        wlan: {
          advancedCustomization: {}
        },
        enableAccountingService: true
      } as unknown as NetworkSaveData

      // eslint-disable-next-line max-len
      expect(tranferSettingsToSave(incomingData, false)).toHaveProperty('authRadiusId')
    })

    it('verify the AAASetting data with WPA3 and editMode', () => {
      const incomingData: NetworkSaveData = {
        type: NetworkTypeEnum.AAA,
        authRadiusId: '',
        authRadius: {
          primary: {
            ip: '1.1.1.1'
          }
        },
        wlan: {
          advancedCustomization: {}
        },
        wlanSecurity: WlanSecurityEnum.WPA3,
        enableAccountingService: true
      } as unknown as NetworkSaveData

      // eslint-disable-next-line max-len
      expect(tranferSettingsToSave(incomingData, true)).not.toHaveProperty(['wlan', 'vlanId'])
    })

    it('verify AAASetting with macAddressAuthenticationConfiguration in editMode',() => {
      const incomingData: NetworkSaveData = {
        type: NetworkTypeEnum.AAA,
        authRadiusId: '',
        authRadius: {
          primary: {
            ip: '1.1.1.1'
          }
        },
        wlan: {
          advancedCustomization: {},
          macAddressAuthenticationConfiguration: {
            macAddressAuthentication: true,
            macAuthMacFormat: 'Lower'
          }
        },
        enableAccountingService: false
      } as unknown as NetworkSaveData

      // eslint-disable-next-line max-len
      expect(tranferSettingsToSave(incomingData, true)).toHaveProperty(['wlan', 'macAddressAuthenticationConfiguration', 'macAuthMacFormat'])
    })
  })

  it('verify AAASetting with certificateTemplateId in editMode',() => {
    const incomingData: NetworkSaveData = {
      type: NetworkTypeEnum.AAA,
      useCertificateTemplate: true,
      certificateTemplateId: 'testId'
    } as unknown as NetworkSaveData

    // eslint-disable-next-line max-len
    expect(tranferSettingsToSave(incomingData, true)).toMatchObject({
      certificateTemplateId: 'testId',
      useCertificateTemplate: true
    })
  })
})
