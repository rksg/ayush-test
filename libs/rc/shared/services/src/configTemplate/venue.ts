import {
  AAASetting,
  CapabilitiesApModel,
  CommonResult,
  ConfigTemplateUrlsInfo,
  ExternalAntenna,
  LocalUser,
  Mesh,
  RadiusServer,
  TableResult,
  TacacsServer,
  TriBandSettings,
  Venue,
  VenueApModelBandModeSettings,
  VenueApSmartMonitor,
  VenueApRebootTimeout,
  VenueIot,
  VenueBssColoring,
  VenueClientAdmissionControl,
  VenueConfigTemplateUrlsInfo,
  VenueDHCPPoolInst,
  VenueDHCPProfile,
  VenueDefaultRegulatoryChannels,
  VenueDirectedMulticast,
  VenueDosProtection,
  VenueExtended,
  VenueLanPorts,
  VenueLoadBalancing,
  VenueMdnsFencingPolicy,
  VenueRadioCustomization,
  VenueRadiusOptions,
  VenueSettings,
  VenueSwitchConfiguration,
  onActivityMessageReceived,
  onSocketActivityChanged,
  GetApiVersionHeader,
  ApiVersionEnum
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'

import { commonQueryFn, getVenueDHCPProfileFn, transformGetVenueDHCPPoolsResponse }      from '../servicePolicy.utils'
import { handleCallbackWhenActivitySuccess }                                             from '../utils'
import {
  createVenueDefaultRadioCustomizationFetchArgs, createVenueDefaultRegulatoryChannelsFetchArgs,
  createVenueRadioCustomizationFetchArgs, createVenueUpdateRadioCustomizationFetchArgs
} from '../venue.utils'

import { configTemplateApi }                  from './common'
import { useCasesToRefreshVenueTemplateList } from './constants'

export const venueConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    addVenueTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.addVenueTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    deleteVenueTemplate: build.mutation<Venue, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.deleteVenueTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    updateVenueTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    getVenueTemplate: build.query<VenueExtended, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueTemplate),
      providesTags: [{ type: 'VenueTemplate', id: 'DETAIL' }]
    }),
    getVenuesTemplateList: build.query<TableResult<Venue>, RequestPayload>({
      query: commonQueryFn(
        ConfigTemplateUrlsInfo.getVenuesTemplateList,
        ConfigTemplateUrlsInfo.getVenuesTemplateListRbac
      ),
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'VenueTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshVenueTemplateList, () => {
            // eslint-disable-next-line max-len
            api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    // eslint-disable-next-line max-len
    getVenueTemplateApCapabilities: build.query<{ version: string, apModels: CapabilitiesApModel[] }, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueApCapabilities,
        VenueConfigTemplateUrlsInfo.getVenueApCapabilitiesRbac
      )
    }),
    getVenueTemplateTripleBandRadioSettings: build.query<TriBandSettings, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueTripleBandRadioSettings),
      providesTags: [{ type: 'VenueTemplate', id: 'TripleBandRadioSettings' }]
    }),
    updateVenueTemplateTripleBandRadioSettings: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueTripleBandRadioSettings),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'TripleBandRadioSettings' }]
    }),
    // eslint-disable-next-line max-len
    getVenueTemplateDefaultRegulatoryChannels: build.query<VenueDefaultRegulatoryChannels, RequestPayload>({
      query: createVenueDefaultRegulatoryChannelsFetchArgs(true)
    }),
    // eslint-disable-next-line max-len
    getVenueTemplateDefaultRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: createVenueDefaultRadioCustomizationFetchArgs(true)
    }),
    getVenueTemplateRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: createVenueRadioCustomizationFetchArgs(true),
      providesTags: [{ type: 'VenueTemplateRadio', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateVenueTemplateRadioCustomization'], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplateRadio', id: 'LIST' }]))
          })
        })
      }
    }),
    updateVenueTemplateRadioCustomization: build.mutation<CommonResult, RequestPayload>({
      query: createVenueUpdateRadioCustomizationFetchArgs(true),
      invalidatesTags: [{ type: 'VenueTemplateRadio', id: 'LIST' }]
    }),
    getVenueTemplateLoadBalancing: build.query<VenueLoadBalancing, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueLoadBalancing,
        VenueConfigTemplateUrlsInfo.getVenueLoadBalancingRbac
      ),
      providesTags: [{ type: 'VenueTemplate', id: 'LOAD_BALANCING' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateVenueTemplateLoadBalancing'], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'LOAD_BALANCING' }]))
          })
        })
      }
    }),
    updateVenueTemplateLoadBalancing: build.mutation<VenueLoadBalancing, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueLoadBalancing,
        VenueConfigTemplateUrlsInfo.updateVenueLoadBalancingRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'LOAD_BALANCING' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          // eslint-disable-next-line max-len
          await handleCallbackWhenActivitySuccess(api, msg, 'UpdateVenueTemplateLoadBalancing', requestArgs.callback)
        })
      }
    }),
    // eslint-disable-next-line max-len
    getVenueTemplateClientAdmissionControl: build.query<VenueClientAdmissionControl, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueClientAdmissionControl,
        VenueConfigTemplateUrlsInfo.getVenueClientAdmissionControlRbac
      ),
      providesTags: [{ type: 'VenueTemplate', id: 'ClientAdmissionControl' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueTemplateClientAdmissionControl: build.mutation<VenueClientAdmissionControl, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueClientAdmissionControl,
        VenueConfigTemplateUrlsInfo.updateVenueClientAdmissionControlRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'ClientAdmissionControl' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          // eslint-disable-next-line max-len
          await handleCallbackWhenActivitySuccess(api, msg, 'UpdateVenueTemplateClientAdmissionControlSettings', requestArgs.callback)
        })
      }
    }),
    getVenueTemplateExternalAntenna: build.query<ExternalAntenna[], RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueExternalAntenna,
        VenueConfigTemplateUrlsInfo.getVenueExternalAntennaRbac
      ),
      providesTags: [{ type: 'VenueTemplateExternalAntenna', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateVenueTemplateExternalAntenna'], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplateExternalAntenna', id: 'LIST' }]))
          })
        })
      }
    }),
    updateVenueTemplateExternalAntenna: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueExternalAntenna,
        VenueConfigTemplateUrlsInfo.updateVenueExternalAntennaRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplateExternalAntenna', id: 'LIST' }]
    }),
    getVenueTemplateSettings: build.query<VenueSettings, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueSettings),
      providesTags: [{ type: 'VenueTemplate', id: 'WIFI_SETTINGS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateVenueTemplateMeshOptions'], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'WIFI_SETTINGS' }]))
          })
        })
      }
    }),
    // only exist in v1(RBAC version)
    getVenueTemplateMesh: build.query<Mesh, RequestPayload>({
      query: ({ params, isWifiMeshIndependents56GEnable }) => {
        // eslint-disable-next-line max-len
        const customHeaders = GetApiVersionHeader(isWifiMeshIndependents56GEnable? ApiVersionEnum.v1_1 :ApiVersionEnum.v1)
        return {
          ...createHttpRequest(VenueConfigTemplateUrlsInfo.getVenueMeshRbac, params, customHeaders)
        }
      },
      providesTags: [{ type: 'VenueTemplate', id: 'VENUE_MESH_SETTINGS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateVenueTemplateApMeshSettings'], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'VENUE_MESH_SETTINGS' }]))
          })
        })
      }
    }),
    updateVenueTemplateMesh: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueMesh,
        VenueConfigTemplateUrlsInfo.updateVenueMeshRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'VENUE_MESH_SETTINGS' }]
    }),
    getVenueTemplateLanPorts: build.query<VenueLanPorts[], RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueLanPorts,
        VenueConfigTemplateUrlsInfo.getVenueLanPortsRbac
      )
    }),
    updateVenueTemplateLanPorts: build.mutation<VenueLanPorts[], RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueLanPorts,
        VenueConfigTemplateUrlsInfo.updateVenueLanPortsRbac
      )
    }),
    getVenueTemplateDirectedMulticast: build.query<VenueDirectedMulticast, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueDirectedMulticast,
        VenueConfigTemplateUrlsInfo.getVenueDirectedMulticastRbac
      ),
      providesTags: [{ type: 'VenueTemplate', id: 'DIRECTED_MULTICAST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateVenueTemplateDirectedMulticast'], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'DIRECTED_MULTICAST' }]))
          })
        })
      }
    }),
    updateVenueTemplateDirectedMulticast: build.mutation<VenueDirectedMulticast, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueDirectedMulticast,
        VenueConfigTemplateUrlsInfo.updateVenueDirectedMulticastRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'DIRECTEDMULTICAST' }]
    }),
    getVenueTemplateRadiusOptions: build.query<VenueRadiusOptions, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueRadiusOptions,
        VenueConfigTemplateUrlsInfo.getVenueRadiusOptionsRbac
      ),
      providesTags: [{ type: 'VenueTemplate', id: 'RADIUS_OPTIONS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateVenueTemplateRadiusOptions'], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'RADIUS_OPTIONS' }]))
          })
        })
      }
    }),
    updateVenueTemplateRadiusOptions: build.mutation<VenueRadiusOptions, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueRadiusOptions,
        VenueConfigTemplateUrlsInfo.updateVenueRadiusOptionsRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'RADIUS_OPTIONS' }]
    }),
    getVenueTemplateDoSProtection: build.query<VenueDosProtection, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getDenialOfServiceProtection,
        VenueConfigTemplateUrlsInfo.getDenialOfServiceProtectionRbac
      )
    }),
    updateVenueTemplateDoSProtection: build.mutation<VenueDosProtection, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateDenialOfServiceProtection,
        VenueConfigTemplateUrlsInfo.updateDenialOfServiceProtectionRbac
      )
    }),
    getVenueTemplateMdnsFencing: build.query<VenueMdnsFencingPolicy, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueMdnsFencingPolicy,
        VenueConfigTemplateUrlsInfo.getVenueMdnsFencingPolicyRbac
      ),
      providesTags: [{ type: 'VenueTemplate', id: 'MDNS_FENCING' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateVenueTemplateBonjourFencing'], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'MDNS_FENCING' }]))
          })
        })
      }
    }),
    updateVenueTemplateMdnsFencing: build.mutation<VenueMdnsFencingPolicy, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueMdnsFencingPolicy,
        VenueConfigTemplateUrlsInfo.updateVenueMdnsFencingPolicyRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'MDNS_FENCING' }]
    }),
    getVenueTemplateBssColoring: build.query<VenueBssColoring, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueBssColoring,
        VenueConfigTemplateUrlsInfo.getVenueBssColoringRbac
      )
    }),
    updateVenueTemplateBssColoring: build.mutation<VenueBssColoring, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueBssColoring,
        VenueConfigTemplateUrlsInfo.updateVenueBssColoringRbac
      )
    }),
    getVenueTemplateDhcpProfile: build.query<VenueDHCPProfile, RequestPayload>({
      queryFn: getVenueDHCPProfileFn(true),
      providesTags: [{ type: 'VenueTemplate', id: 'DHCP_PROFILE' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          // eslint-disable-next-line max-len
          onActivityMessageReceived(msg,
            ['UpdateVenueTemplateDhcpConfigServiceProfileSetting',
              'ActivateDhcpConfigServiceProfileTemplateAndUpdateSettings',
              'DeactivateDhcpConfigServiceProfileTemplate'
            ], () => {
            // eslint-disable-next-line max-len
              api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'DHCP_PROFILE' }]))
            })
        })
      }

    }),
    updateVenueTemplateDhcpProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac, enableService }) => {
        const url = !enableRbac ?
          VenueConfigTemplateUrlsInfo.updateVenueDhcpProfile :
          // eslint-disable-next-line max-len
          (enableService ? VenueConfigTemplateUrlsInfo.bindVenueDhcpProfile : VenueConfigTemplateUrlsInfo.unbindVenueDhcpProfile)
        const req = createHttpRequest(url, params)
        return {
          ...req,
          ...(enableRbac && !enableService ? {} : { body: JSON.stringify(payload) })
        }
      }
    }),
    getVenueTemplateDhcpPools: build.query<VenueDHCPPoolInst[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const url = enableRbac
          ? VenueConfigTemplateUrlsInfo.getDhcpUsagesRbac
          : VenueConfigTemplateUrlsInfo.getVenueDhcpActivePools
        const req = createHttpRequest(url, params)
        return {
          ...req
        }
      },
      transformResponse: transformGetVenueDHCPPoolsResponse,
      providesTags: [{ type: 'VenueTemplate', id: 'DHCP_POOL_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'DeactivateVenueTemplateDhcpPool',
            'ActivateVenueTemplateDhcpPool'
          ]
          onActivityMessageReceived(msg, activities, () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'DHCP_POOL_LIST' }]))
          })
        })
      }
    }),
    activateVenueTemplateDhcpPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const url = enableRbac ?
          VenueConfigTemplateUrlsInfo.bindVenueDhcpProfile
          : VenueConfigTemplateUrlsInfo.activateVenueDhcpPool
        const req = createHttpRequest(url, params)
        return {
          ...req,
          ...(enableRbac ? { body: JSON.stringify(payload) } : {})
        }
      }
    }),
    deactivateVenueTemplateDhcpPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const url = enableRbac ?
          VenueConfigTemplateUrlsInfo.bindVenueDhcpProfile
          : VenueConfigTemplateUrlsInfo.deactivateVenueDhcpPool
        const req = createHttpRequest(url, params)
        return {
          ...req,
          ...(enableRbac ? { body: JSON.stringify(payload) } : {})
        }
      }
    }),
    // eslint-disable-next-line max-len
    getVenueTemplateApModelBandModeSettings: build.query<VenueApModelBandModeSettings[], RequestPayload<void>>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        return createHttpRequest(VenueConfigTemplateUrlsInfo.getVenueApModelBandModeSettings, params)
      },
      providesTags: [{ type: 'VenueTemplate', id: 'BandModeSettings' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueTemplateApModelBandModeSettings: build.mutation<CommonResult, RequestPayload<VenueApModelBandModeSettings[]>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(VenueConfigTemplateUrlsInfo.updateVenueApModelBandModeSettings, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'VenueTemplate', id: 'BandModeSettings' }]
    }),
    getVenueTemplateCityList: build.query<{ name: string }[], RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueCityList,
        VenueConfigTemplateUrlsInfo.getVenueCityListRbac
      ),
      transformResponse: (result: { cityList: { name: string }[] }) => {
        return result.cityList
      }
    }),
    getVenueTemplateSwitchSetting: build.query<VenueSwitchConfiguration, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueSwitchSetting,
        VenueConfigTemplateUrlsInfo.getVenueSwitchSettingRbac
      ),
      providesTags: [{ type: 'VenueTemplate', id: 'SWITCH_SETTING' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateVenueTemplateSwitchSetting'
          ], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'SWITCH_SETTING' }]))
          })
        })
      }
    }),
    updateVenueTemplateSwitchSetting: build.mutation<Venue, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueSwitchSetting,
        VenueConfigTemplateUrlsInfo.updateVenueSwitchSettingRbac
      )
    }),
    getVenueTemplateSwitchAaaSetting: build.query<AAASetting, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueSwitchAaaSetting,
        VenueConfigTemplateUrlsInfo.getVenueSwitchAaaSettingRbac
      ),
      providesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddVenueTemplateAaaServer',
            'UpdateVenueTemplateAaaServer',
            'DeleteVenueTemplateAaaServer'
          ], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]))
          })
        })
      }
    }),
    updateVenueTemplateSwitchAAASetting: build.mutation<AAASetting, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueSwitchAaaSetting,
        VenueConfigTemplateUrlsInfo.updateVenueSwitchAaaSettingRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'DETAIL' }]
    }),
    // eslint-disable-next-line max-len
    getVenueTemplateSwitchAAAServerList: build.query<TableResult<RadiusServer | TacacsServer | LocalUser>, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueSwitchAaaServerList,
        VenueConfigTemplateUrlsInfo.getVenueSwitchAaaServerListRbac
      ),
      providesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    // eslint-disable-next-line max-len
    deleteVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.deleteVenueSwitchAaaServer,
        VenueConfigTemplateUrlsInfo.deleteVenueSwitchAaaServerRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    bulkDeleteVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.bulkDeleteVenueSwitchAaaServer,
        VenueConfigTemplateUrlsInfo.bulkDeleteVenueSwitchAaaServerRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    addVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.addVenueSwitchAaaServer,
        VenueConfigTemplateUrlsInfo.addVenueSwitchAaaServerRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueSwitchAaaServer,
        VenueConfigTemplateUrlsInfo.updateVenueSwitchAaaServerRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
    }),
    getVenueTemplateApSmartMonitorSettings: build.query<VenueApSmartMonitor, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        return createHttpRequest(VenueConfigTemplateUrlsInfo.getVenueApSmartMonitorSettings, params)
      },
      providesTags: [{ type: 'VenueTemplate', id: 'SmartMonitorSettings' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueTemplateApSmartMonitorSettings: build.mutation<CommonResult, RequestPayload<VenueApSmartMonitor>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(VenueConfigTemplateUrlsInfo.updateVenueApSmartMonitorSettings, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'VenueTemplate', id: 'SmartMonitorSettings' }]
    }),
    getVenueTemplateApIotSettings: build.query<VenueIot, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        return createHttpRequest(VenueConfigTemplateUrlsInfo.getVenueApIotSettings, params)
      },
      providesTags: [{ type: 'VenueTemplate', id: 'IotSettings' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueTemplateApIotSettings: build.mutation<CommonResult, RequestPayload<VenueIot>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(VenueConfigTemplateUrlsInfo.updateVenueApIotSettings, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'VenueTemplate', id: 'IotSettings' }]
    }),
    getVenueTemplateApRebootTimeoutSettings: build.query<VenueApRebootTimeout, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        return createHttpRequest(VenueConfigTemplateUrlsInfo.getVenueApRebootTimeoutSettings, params)
      },
      providesTags: [{ type: 'VenueTemplate', id: 'RebootTimeoutSettings' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueTemplateApRebootTimeoutSettings: build.mutation<CommonResult, RequestPayload<VenueApRebootTimeout>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(VenueConfigTemplateUrlsInfo.updateVenueApRebootTimeoutSettings, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'VenueTemplate', id: 'RebootTimeoutSettings' }]
    })
  })
})

export const {
  useAddVenueTemplateMutation,
  useDeleteVenueTemplateMutation,
  useUpdateVenueTemplateMutation,
  useGetVenueTemplateQuery,
  useGetVenuesTemplateListQuery,
  useLazyGetVenuesTemplateListQuery,
  useGetVenueTemplateApCapabilitiesQuery,
  useGetVenueTemplateTripleBandRadioSettingsQuery,
  useUpdateVenueTemplateTripleBandRadioSettingsMutation,
  useGetVenueTemplateDefaultRegulatoryChannelsQuery,
  useGetVenueTemplateDefaultRadioCustomizationQuery,
  useGetVenueTemplateRadioCustomizationQuery,
  useUpdateVenueTemplateRadioCustomizationMutation,
  useGetVenueTemplateLoadBalancingQuery,
  useUpdateVenueTemplateLoadBalancingMutation,
  useGetVenueTemplateClientAdmissionControlQuery,
  useUpdateVenueTemplateClientAdmissionControlMutation,
  useGetVenueTemplateExternalAntennaQuery,
  useUpdateVenueTemplateExternalAntennaMutation,
  useGetVenueTemplateSettingsQuery,
  useGetVenueTemplateMeshQuery,
  useUpdateVenueTemplateMeshMutation,
  useGetVenueTemplateLanPortsQuery,
  useUpdateVenueTemplateLanPortsMutation,
  useGetVenueTemplateDirectedMulticastQuery,
  useUpdateVenueTemplateDirectedMulticastMutation,
  useGetVenueTemplateRadiusOptionsQuery,
  useUpdateVenueTemplateRadiusOptionsMutation,
  useGetVenueTemplateDoSProtectionQuery,
  useUpdateVenueTemplateDoSProtectionMutation,
  useGetVenueTemplateMdnsFencingQuery,
  useUpdateVenueTemplateMdnsFencingMutation,
  useGetVenueTemplateBssColoringQuery,
  useUpdateVenueTemplateBssColoringMutation,
  useGetVenueTemplateDhcpProfileQuery,
  useGetVenueTemplateDhcpPoolsQuery,
  useActivateVenueTemplateDhcpPoolMutation,
  useDeactivateVenueTemplateDhcpPoolMutation,
  useUpdateVenueTemplateDhcpProfileMutation,
  useGetVenueTemplateApModelBandModeSettingsQuery,
  useUpdateVenueTemplateApModelBandModeSettingsMutation,
  useGetVenueTemplateCityListQuery,
  useGetVenueTemplateSwitchSettingQuery,
  useUpdateVenueTemplateSwitchSettingMutation,
  useGetVenueTemplateSwitchAaaSettingQuery,
  useUpdateVenueTemplateSwitchAAASettingMutation,
  useGetVenueTemplateSwitchAAAServerListQuery,
  useDeleteVenueTemplateSwitchAAAServerMutation,
  useBulkDeleteVenueTemplateSwitchAAAServerMutation,
  useAddVenueTemplateSwitchAAAServerMutation,
  useUpdateVenueTemplateSwitchAAAServerMutation,
  useGetVenueTemplateApSmartMonitorSettingsQuery,
  useUpdateVenueTemplateApSmartMonitorSettingsMutation,
  useGetVenueTemplateApRebootTimeoutSettingsQuery,
  useUpdateVenueTemplateApRebootTimeoutSettingsMutation,
  useGetVenueTemplateApIotSettingsQuery,
  useUpdateVenueTemplateApIotSettingsMutation
} = venueConfigTemplateApi
