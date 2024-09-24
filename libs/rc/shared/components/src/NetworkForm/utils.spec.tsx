import { FormInstance } from 'antd'
import { rest }         from 'msw'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { softGreApi }                                             from '@acx-ui/rc/services'
import {
  ClientIsolationUrls,
  ConfigTemplateType,
  DpskWlanAdvancedCustomization,
  GuestNetworkTypeEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  RadioEnum,
  TunnelProfileUrls,
  TunnelTypeEnum,
  WifiUrlsInfo,
  WifiCallingUrls,
  WifiRbacUrlsInfo,
  ServicesConfigTemplateUrlsInfo,
  ConfigTemplateContext,
  AaaUrls,
  NetworkVenue,
  SoftGreUrls
} from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { hasAccountingRadius, hasAuthRadius, hasVxLanTunnelProfile, useClientIsolationActivations, useNetworkVxLanTunnelProfileInfo, useRadiusServer, useServicePolicyEnabledWithConfigTemplate, useWifiCalling, getDefaultMloOptions, useUpdateSoftGreActivations } from './utils'

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
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE)
      // eslint-disable-next-line max-len
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.CONFIG_TEMPLATE)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.VENUE))

      expect(result.current).toBe(false)
    })

    it('should return true if policy config template and policy enabled', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE)
      // eslint-disable-next-line max-len
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.CONFIG_TEMPLATE)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.ACCESS_CONTROL))

      expect(result.current).toBe(true)
    })

    it('should return true if service config template and service enabled', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE)
      // eslint-disable-next-line max-len
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.CONFIG_TEMPLATE)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.PORTAL))

      expect(result.current).toBe(true)
    })

    it('should return true if it is not a config template', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE)
      // eslint-disable-next-line max-len
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.CONFIG_TEMPLATE)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.PORTAL))

      expect(result.current).toBe(true)
    })
  })

  describe('useClientIsolationActivations', () => {
    const mockForm = {
      setFieldsValue: jest.fn()
    } as unknown as FormInstance
    const mockBindClientIsolation = jest.fn()
    const mockUnbindClientIsolation = jest.fn()
    beforeEach(() => {
      jest.clearAllMocks()
      mockServer.use(
        rest.post(
          ClientIsolationUrls.queryClientIsolation.url,
          (_, res, ctx) => {
            return res(ctx.json({ data: [] }))
          }
        ),
        rest.put(
          WifiUrlsInfo.bindClientIsolation.url,
          (_, res, ctx) => {
            mockBindClientIsolation()
            return res(ctx.json({ }))
          }
        ),
        rest.delete(
          WifiUrlsInfo.unbindClientIsolation.url,
          (_, res, ctx) => {
            mockUnbindClientIsolation()
            return res(ctx.json({ }))
          }
        )
      )
    })

    it('should call bind updateClientIsolationActivations function', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
      const saveData = { venues: [{
        venueId: 'venue-id',
        clientIsolationAllowlistId: 'allowlist-id',
        allApGroupsRadio: RadioEnum.Both }] }
      const oldSaveData = { venues: [{
        venueId: 'venue-id',
        clientIsolationAllowlistId: undefined,
        allApGroupsRadio: RadioEnum.Both }] }

      const { result } = renderHook(() =>
        useClientIsolationActivations(false, saveData, jest.fn(), mockForm), { wrapper: Provider })

      // eslint-disable-next-line max-len
      await result.current.updateClientIsolationActivations(saveData, oldSaveData, 'test-network-id')

      expect(mockBindClientIsolation).toHaveBeenCalled()
    })

    it('should handle unbind updateClientIsolationActivations function', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
      const saveData = { venues: [{ venueId: 'venue-id', allApGroupsRadio: RadioEnum.Both }] }
      const oldSaveData = { venues: [{
        venueId: 'venue-id',
        clientIsolationAllowlistId:
        'allowlist-id', allApGroupsRadio: RadioEnum.Both }] }

      const { result } = renderHook(() =>
        useClientIsolationActivations(false, saveData, jest.fn(), mockForm), { wrapper: Provider })

      // eslint-disable-next-line max-len
      await result.current.updateClientIsolationActivations(saveData, oldSaveData, 'test-network-id')

      expect(mockUnbindClientIsolation).toHaveBeenCalled()
    })
  })

  describe('useRadiusServer hook', () => {
    const spyQueryFn = jest.fn()
    const spyRadiusSettingsFn = jest.fn()
    const spyGetAaaFn = jest.fn()

    beforeEach(() => {
      mockServer.use(
        rest.post(
          AaaUrls.queryAAAPolicyList.url,
          (_, res, ctx) => {
            spyQueryFn()
            return res(ctx.json({
              data: [
                {
                  id: 'mock-radius-server-id',
                  type: 'AUTHENTICATION'
                },
                {
                  id: 'mock-radius-server-id',
                  type: 'ACCOUNTING'
                }]
            }))}
        ),
        rest.get(
          WifiRbacUrlsInfo.getRadiusServerSettings.url,
          (_, res, ctx) => {
            spyRadiusSettingsFn()
            return res(ctx.json({
              enableAccountingProxy: false,
              enableAuthProxy: false
            }))}
        ),
        rest.get(
          AaaUrls.getAAAPolicyRbac.url,
          (_, res, ctx) => {
            spyGetAaaFn()
            return res(ctx.json({
              primary: {
                ip: '1.1.1.1',
                port: '1812',
                sharedSecret: '124124124214'
              }
            }))
          }
        )
      )
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.restoreAllMocks()
    })

    it('radiusServerConfigurations should be undefined while RBAC disabled', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      const { result } = renderHook(
        () => useRadiusServer(),
        {
          wrapper: Provider,
          route: { params: { networkId: 'mock-network-id' } }
        })

      expect(result.current.radiusServerConfigurations).toBeUndefined()
    })

    it('radiusServerConfigurations should not be undefined while RBAC enabled', async () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
      jest.mocked(useIsSplitOn)
        .mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)

      const { result } = renderHook(
        () => useRadiusServer(),
        {
          wrapper: Provider,
          route: { params: { networkId: 'mock-network-id' } }
        })

      await waitFor(() => expect(spyQueryFn).toHaveBeenCalled())
      await waitFor(() => expect(spyRadiusSettingsFn).toHaveBeenCalled())
      await waitFor(() => expect(spyGetAaaFn).toHaveBeenCalled())

      await waitFor(() => expect(result.current.radiusServerConfigurations).not.toBeUndefined())
    })

    it('should updateRadiusServer successfully while RBAC enabled', async () => {
      const spyUpdateRadiusSettingsFn = jest.fn()
      const spyActivateRadiusFn = jest.fn()
      const spyDeactivateRadiusFn = jest.fn()
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
      jest.mocked(useIsSplitOn)
        .mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)

      mockServer.use(
        rest.put(
          WifiRbacUrlsInfo.updateRadiusServerSettings.url,
          (_, res, ctx) => {
            spyUpdateRadiusSettingsFn()
            return res(ctx.json({}))
          }
        ),
        rest.put(
          WifiRbacUrlsInfo.activateRadiusServer.url,
          (_, res, ctx) => {
            spyActivateRadiusFn()
            return res(ctx.json({}))
          }
        ),
        rest.delete(
          WifiRbacUrlsInfo.deactivateRadiusServer.url,
          (_, res, ctx) => {
            spyDeactivateRadiusFn()
            return res(ctx.json({}))
          }
        )
      )

      const { result } = renderHook(
        () => useRadiusServer(),
        {
          wrapper: Provider,
          route: { params: { networkId: 'mock-network-id' } }
        })

      const updateRadius = result.current.updateRadiusServer

      await updateRadius(
        { authRadiusId: 'new-radius-id' },
        { authRadiusId: 'old-radius-id' },
        'new-networkId'
      )

      await waitFor(() => expect(spyUpdateRadiusSettingsFn).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(spyActivateRadiusFn).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(spyDeactivateRadiusFn).toHaveBeenCalledTimes(0))
    })
  })

  describe('useWifiCalling hook', () => {
    const queryWifiCallingFn = jest.fn()
    const activateFn = jest.fn()
    const deactivateFn = jest.fn()

    beforeEach(() => {
      queryWifiCallingFn.mockClear()
      activateFn.mockClear()
      deactivateFn.mockClear()
    })

    describe('[Service/Policy] useWifiCalling hook', () => {
      beforeAll(() => {
        jest.restoreAllMocks()

        mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
        jest.mocked(useIsSplitOn)
          .mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
      })

      beforeEach(() => {
        mockServer.use(
          rest.post(WifiCallingUrls.queryWifiCalling.url,
            (_, res, ctx) => {
              queryWifiCallingFn()
              return res(ctx.json({ data: [
                { id: 'service-id-1' },
                { id: 'service-id-2' }
              ] }))
            }
          ),
          rest.put(WifiCallingUrls.activateWifiCalling.url,
            (_, res, ctx) => {
              activateFn()
              return res(ctx.json({}))
            }
          ),
          rest.delete(WifiCallingUrls.deactivateWifiCalling.url,
            (_, res, ctx) => {
              deactivateFn()
              return res(ctx.json({}))
            }
          )
        )
      })

      it('should get wifiCalling data via RBAC', async () => {
        renderHook(() => useWifiCalling(false),
          { route: { params: { networkId: 'networkId' } }, wrapper: Provider })

        await waitFor(() => expect(queryWifiCallingFn).toHaveBeenCalled())
      })

      it('should activateAll via RBAC', async () => {
        mockServer.use(
          rest.post(WifiCallingUrls.queryWifiCalling.url,
            (_, res, ctx) => {
              queryWifiCallingFn()
              return res(ctx.json({ data: [] }))
            }
          )
        )

        const { result } = renderHook(() => useWifiCalling(false),
          { route: { params: { networkId: 'networkId' } }, wrapper: Provider })

        await waitFor(() => expect(queryWifiCallingFn).toHaveBeenCalled())
        const saveData = {
          wlan: {
            advancedCustomization: {
              wifiCallingIds: ['new-service-id-1', 'new-service-id-2'],
              wifiCallingEnabled: true
            }
          }
        } as NetworkSaveData

        await result.current.updateWifiCallingActivation('network-id', saveData)

        expect(activateFn).toHaveBeenCalledTimes(2)
        expect(deactivateFn).not.toHaveBeenCalled()
      })

      it('should deactivateAll via RBAC', async () => {
        const { result } = renderHook(() => useWifiCalling(false),
          { route: { params: { networkId: 'networkId' } }, wrapper: Provider })

        await waitFor(() => expect(queryWifiCallingFn).toHaveBeenCalled())
        const saveData = {
          wlan: {
            advancedCustomization: {
              wifiCallingEnabled: false
            }
          }
        } as NetworkSaveData

        await result.current.updateWifiCallingActivation('network-id', saveData)

        expect(activateFn).not.toHaveBeenCalled()
        expect(deactivateFn).toHaveBeenCalledTimes(2)
      })

      it('should activate/deactivate wifi calling via RBAC', async () => {
        const { result } = renderHook(() => useWifiCalling(false),
          { route: { params: { networkId: 'networkId' } }, wrapper: Provider })

        await waitFor(() => expect(queryWifiCallingFn).toHaveBeenCalled())

        const saveData = {
          wlan: {
            advancedCustomization: {
              wifiCallingIds: ['new-service-id'],
              wifiCallingEnabled: true
            }
          }
        } as NetworkSaveData

        await result.current.updateWifiCallingActivation('network-id', saveData)

        expect(activateFn).toHaveBeenCalled()
        expect(deactivateFn).toHaveBeenCalled()
      })
    })

    describe('[Config Template] useWifiCalling hook', () => {
      beforeAll(() => {
        jest.restoreAllMocks()

        mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
        jest.mocked(useIsSplitOn)
          .mockImplementation(ff => ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
      })

      beforeEach(() => {
        mockServer.use(
          rest.post(ServicesConfigTemplateUrlsInfo.queryWifiCalling.url,
            (_, res, ctx) => {
              queryWifiCallingFn()
              return res(ctx.json({ data: [
                { id: 'service-id-1' },
                { id: 'service-id-2' }
              ] }))
            }
          ),
          rest.put(ServicesConfigTemplateUrlsInfo.activateWifiCalling.url,
            (_, res, ctx) => {
              activateFn()
              return res(ctx.json({}))
            }
          ),
          rest.delete(ServicesConfigTemplateUrlsInfo.deactivateWifiCalling.url,
            (_, res, ctx) => {
              deactivateFn()
              return res(ctx.json({}))
            }
          )
        )
      })

      it('should activate/deactivate wifi calling via RBAC', async () => {
        const { result } = renderHook(() => useWifiCalling(false),
          { route: { params: { networkId: 'networkId' } },
            wrapper: ({ children }) =>
              <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
                <Provider>{children}</Provider>
              </ConfigTemplateContext.Provider>
          })

        await waitFor(() => expect(queryWifiCallingFn).toHaveBeenCalled())

        const saveData = {
          wlan: {
            advancedCustomization: {
              wifiCallingIds: ['new-service-id'],
              wifiCallingEnabled: true
            }
          }
        } as NetworkSaveData

        await result.current.updateWifiCallingActivation('network-id', saveData)

        expect(activateFn).toHaveBeenCalled()
        expect(deactivateFn).toHaveBeenCalled()
      })

    })
  })

  describe('test getDefaultMloOptions func', () => {
    it('should get default Mlo options correctly when FF is off', () => {
      const wifi7Mlo3LinkFlag = false
      const defaultWithFFoff = {
        enable24G: true,
        enable50G: true,
        enable6G: false
      }
      const actual = getDefaultMloOptions(wifi7Mlo3LinkFlag)
      expect(actual).toEqual(defaultWithFFoff)
    })
    it('should get default Mlo options correctly when FF is on', () => {
      const wifi7Mlo3LinkFlag = true
      const defaultWithFFon = {
        enable24G: true,
        enable50G: true,
        enable6G: true
      }
      const actual = getDefaultMloOptions(wifi7Mlo3LinkFlag)
      expect(actual).toEqual(defaultWithFFon)
    })
  })

  describe('useUpdateSoftGreActivations', () => {
    const networkId = 'network-id'
    const mockedActivateSoftGre = jest.fn()
    const mockedDeactivateSoftGre = jest.fn()

    beforeEach(() => {
      store.dispatch(softGreApi.util.resetApiState())
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockedActivateSoftGre.mockClear()
      mockedDeactivateSoftGre.mockClear()
      mockServer.use(
        rest.put(
          SoftGreUrls.activateSoftGre.url,
          (_, res, ctx) => {
            mockedActivateSoftGre()
            return res(ctx.status(202))
          }),
        rest.delete(
          SoftGreUrls.dectivateSoftGre.url,
          (_, res, ctx) => {
            mockedDeactivateSoftGre()
            return res(ctx.status(202))
          })
      )}
    )

    it('useUpdateSoftGreActivations(create/edit)', async () => {
      const profileId = 'profile-id'
      const profileName = 'profileName'
      const updates = {
        venue_1: { newProfileId: profileId, newProfileName: profileName, oldProfileId: '' },
        venue_2: { newProfileId: '', newProfileName: '', oldProfileId: profileId }
      }
      const activatedVenues = [{ venueId: 'venue_1' }, { venueId: 'venue_2' }] as NetworkVenue[]

      const { result } = renderHook(() => useUpdateSoftGreActivations(),
        { route: { params: { networkId: 'networkId' } }, wrapper: Provider })

      // eslint-disable-next-line max-len
      await result.current(networkId, updates, activatedVenues, false)

      expect(mockedActivateSoftGre).toBeCalledTimes(1)
      expect(mockedDeactivateSoftGre).toBeCalledTimes(1)
    })

    it('useUpdateSoftGreActivations(clone)', async () => {
      const profileId = 'profile-id'
      const profileName = 'profileName'
      const updates = {
        venue_1: { newProfileId: profileId, newProfileName: profileName, oldProfileId: '' },
        venue_2: { newProfileId: '', newProfileName: '', oldProfileId: profileId }
      }
      const activatedVenues = [{ venueId: 'venue_1' }, { venueId: 'venue_2' }] as NetworkVenue[]

      const { result } = renderHook(() => useUpdateSoftGreActivations(),
        { route: { params: { networkId: 'networkId' } }, wrapper: Provider })

      // eslint-disable-next-line max-len
      await result.current(networkId, updates, activatedVenues, true)

      expect(mockedActivateSoftGre).toBeCalledTimes(1)
      expect(mockedDeactivateSoftGre).not.toBeCalled()
    })
  })
})
