import { rest } from 'msw'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                                                                                           from '@acx-ui/feature-toggle'
import { ConfigTemplateType, DpskWlanAdvancedCustomization, GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum, TunnelProfileUrls, TunnelTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                 from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                                                                          from '@acx-ui/test-utils'

import { hasAccountingRadius, hasAuthRadius, hasVxLanTunnelProfile, useNetworkVxLanTunnelProfileInfo, useServicePolicyEnabledWithConfigTemplate } from './utils'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('Network utils test', () => {
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

    const guestAlwayAccessWlanData = {
      guestPortal: {
        wisprPage: {
          customExternalProvider: true,
          authType: 'ALWAYS_ACCEPT'
        }
      }
    }
    expect(hasAuthRadius(guestData, guestAlwayAccessWlanData)).toBeFalsy()

    const guestAccountData = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      enableAccountingService: true,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.WISPr
      }
    }
    expect(hasAuthRadius(guestAccountData, guestAlwayAccessWlanData)).toBeTruthy()

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

  it('test hasVxlanTunnelProfile',async () => {
    const dpskWlanWithTunnelProfile = {
      name: 'testVxlanDisplay',
      type: 'dpsk',
      wlan: {
        advancedCustomization: {
          tunnelProfileId: 'test123'
        } as DpskWlanAdvancedCustomization
      }
    } as NetworkSaveData
    expect(hasVxLanTunnelProfile(dpskWlanWithTunnelProfile)).toBeTruthy()

    const dpskWlanWithoutTunnelProfile = {
      name: 'testVxlanDisplay',
      type: 'dpsk'
    } as NetworkSaveData
    expect(hasVxLanTunnelProfile(dpskWlanWithoutTunnelProfile)).toBeFalsy()
  })


  describe('useNetworkVxLanTunnelProfileInfo', () => {
    const mockedTunnelReq = jest.fn()
    beforeEach(() => {
      mockedTunnelReq.mockRestore()
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      jest.mocked(useIsSplitOn).mockReturnValue(true)

      mockServer.use(
        rest.post(
          TunnelProfileUrls.getTunnelProfileViewDataList.url,
          (_, res, ctx) => {
            mockedTunnelReq()
            return res(ctx.json({
              data: [{
                id: 'mocked_tunnel',
                name: 'tunnelProfile1',
                mtuType: 'MANUAL',
                mtuSize: 1450,
                forceFragmentation: true,
                ageTimeMinutes: 20,
                personalIdentityNetworkIds: ['mocked_pin_1'],
                sdLanIds: [],
                networkIds: ['mocked_network_1'],
                type: TunnelTypeEnum.VXLAN
              }, {
                id: 'mocked_tunnel_2',
                name: 'tunnelProfile2',
                mtuType: 'AUTO',
                forceFragmentation: false,
                ageTimeMinutes: 20,
                personalIdentityNetworkIds: [],
                sdLanIds: ['mocked_sdlan_1'],
                networkIds: ['mocked_network_1'],
                type: TunnelTypeEnum.VLAN_VXLAN
              }]
            }))
          }
        )
      )
    })

    it('should bring out tunnel info',async () => {
      const { result } = renderHook(() => {
        return useNetworkVxLanTunnelProfileInfo({
        } as NetworkSaveData)
      }, { wrapper: Provider })

      expect(result.current.enableVxLan).toBe(false)
      expect(result.current.enableTunnel).toBe(false)
      expect(result.current.vxLanTunnels).toBe(undefined)
      await waitFor(() => expect(mockedTunnelReq).toBeCalled())
      await waitFor(() => expect(result.current.enableVxLan).toBe(true))
      expect(result.current.enableTunnel).toBe(true)
    })

    it('should handle with null network data',async () => {
      const { result } = renderHook(() => {
        return useNetworkVxLanTunnelProfileInfo(null)
      }, { wrapper: Provider })

      expect(mockedTunnelReq).not.toBeCalled()
      expect(result.current.enableVxLan).toBe(false)
      expect(result.current.enableTunnel).toBe(false)
      expect(result.current.vxLanTunnels).toBe(undefined)
    })

    it('should return false when edge flag is not ON',async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(false)
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      const { result } = renderHook(() => {
        return useNetworkVxLanTunnelProfileInfo({
        } as NetworkSaveData)
      }, { wrapper: Provider })

      expect(mockedTunnelReq).not.toBeCalled()
      expect(result.current.enableVxLan).toBe(false)
      expect(result.current.enableTunnel).toBe(false)
      expect(result.current.vxLanTunnels).toBe(undefined)
    })
  })

  describe('useServicePolicyEnabledWithConfigTemplate', () => {
    beforeEach(() => {
      jest.restoreAllMocks()
    })

    it('should return false if neither policy nor service config template', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.SERVICES || ff === Features.POLICIES || ff === Features.CONFIG_TEMPLATE
      )
      // eslint-disable-next-line max-len
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.BETA_CONFIG_TEMPLATE)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.VENUE))

      expect(result.current).toBe(false)
    })

    it('should return true if policy config template and policy enabled', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.SERVICES || ff === Features.POLICIES || ff === Features.CONFIG_TEMPLATE
      )
      // eslint-disable-next-line max-len
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.BETA_CONFIG_TEMPLATE)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.ACCESS_CONTROL))

      expect(result.current).toBe(true)
    })

    it('should return true if service config template and service enabled', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.SERVICES || ff === Features.POLICIES || ff === Features.CONFIG_TEMPLATE
      )
      // eslint-disable-next-line max-len
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.BETA_CONFIG_TEMPLATE)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.PORTAL))

      expect(result.current).toBe(true)
    })

    it('should return true if it is not a config template', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.SERVICES || ff === Features.POLICIES || ff === Features.CONFIG_TEMPLATE
      )
      // eslint-disable-next-line max-len
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.BETA_CONFIG_TEMPLATE)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.PORTAL))

      expect(result.current).toBe(true)
    })
  })
})
