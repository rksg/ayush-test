import {
  AAASetting,
  ApiVersionEnum,
  CapabilitiesApModel,
  CommonResult,
  ConfigTemplateUrlsInfo,
  ExternalAntenna,
  LocalUser,
  RadiusServer,
  TableResult,
  TacacsServer,
  TriBandSettings,
  Venue,
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
  onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'

import { commonQueryFn }                                                                 from '../servicePolicy.utils'
import { handleCallbackWhenActivitySuccess }                                             from '../utils'
import {
  createVenueDefaultRadioCustomizationFetchArgs, createVenueDefaultRegulatoryChannelsFetchArgs,
  createVenueRadioCustomizationFetchArgs, createVenueUpdateRadioCustomizationFetchArgs
} from '../venue.utils'

import { configTemplateApi }                  from './common'
import { useCasesToRefreshVenueTemplateList } from './constants'

export const venueConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    addVenueTemplate: build.mutation<VenueExtended, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.addVenueTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    deleteVenueTemplate: build.mutation<Venue, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.deleteVenueTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    updateVenueTemplate: build.mutation<VenueExtended, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    getVenueTemplate: build.query<VenueExtended, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueTemplate),
      providesTags: [{ type: 'VenueTemplate', id: 'DETAIL' }]
    }),
    getVenuesTemplateList: build.query<TableResult<Venue>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getVenuesTemplateList),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueApCapabilities, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.getVenueApCapabilitiesRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      })
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueLoadBalancing, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.getVenueLoadBalancingRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueLoadBalancing, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.updateVenueLoadBalancingRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueClientAdmissionControl, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.getVenueClientAdmissionControlRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
      providesTags: [{ type: 'VenueTemplate', id: 'ClientAdmissionControl' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueTemplateClientAdmissionControl: build.mutation<VenueClientAdmissionControl, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueClientAdmissionControl, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.updateVenueClientAdmissionControlRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'ClientAdmissionControl' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          // eslint-disable-next-line max-len
          await handleCallbackWhenActivitySuccess(api, msg, 'UpdateVenueTemplateClientAdmissionControlSettings', requestArgs.callback)
        })
      }
    }),
    getVenueTemplateExternalAntenna: build.query<ExternalAntenna[], RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueExternalAntenna, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.getVenueExternalAntennaRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueExternalAntenna, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.updateVenueExternalAntennaRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
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
    updateVenueTemplateMesh: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueMesh, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.updateVenueMeshRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'WIFI_SETTINGS' }]
    }),
    getVenueTemplateLanPorts: build.query<VenueLanPorts[], RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueLanPorts)
    }),
    updateVenueTemplateLanPorts: build.mutation<VenueLanPorts[], RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueLanPorts)
    }),
    getVenueTemplateDirectedMulticast: build.query<VenueDirectedMulticast, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueDirectedMulticast, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.getVenueDirectedMulticastRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueDirectedMulticast, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.updateVenueDirectedMulticastRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'DIRECTEDMULTICAST' }]
    }),
    getVenueTemplateRadiusOptions: build.query<VenueRadiusOptions, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueRadiusOptions, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.getVenueRadiusOptionsRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueRadiusOptions, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.updateVenueRadiusOptionsRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'RADIUS_OPTIONS' }]
    }),
    getVenueTemplateDoSProtection: build.query<VenueDosProtection, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getDenialOfServiceProtection, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.getDenialOfServiceProtectionRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      })
    }),
    updateVenueTemplateDoSProtection: build.mutation<VenueDosProtection, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateDenialOfServiceProtection, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.updateDenialOfServiceProtectionRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      })
    }),
    getVenueTemplateMdnsFencing: build.query<VenueMdnsFencingPolicy, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueMdnsFencingPolicy, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.getVenueMdnsFencingPolicyRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueMdnsFencingPolicy, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.updateVenueMdnsFencingPolicyRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'MDNS_FENCING' }]
    }),
    getVenueTemplateBssColoring: build.query<VenueBssColoring, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueBssColoring, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.getVenueBssColoringRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      })
    }),
    updateVenueTemplateBssColoring: build.mutation<VenueBssColoring, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueBssColoring, {
        rbacApiInfo: VenueConfigTemplateUrlsInfo.updateVenueBssColoringRbac,
        rbacApiVersionKey: ApiVersionEnum.v1
      })
    }),
    getVenueTemplateDhcpProfile: build.query<VenueDHCPProfile, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueDhcpProfile),
      providesTags: [{ type: 'VenueTemplate', id: 'DHCP_PROFILE' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          // eslint-disable-next-line max-len
          onActivityMessageReceived(msg, ['UpdateVenueTemplateDhcpConfigServiceProfileSetting'], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'DHCP_PROFILE' }]))
          })
        })
      }

    }),
    updateVenueTemplateDhcpProfile: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueDhcpProfile)
    }),
    getVenueTemplateDhcpPools: build.query<VenueDHCPPoolInst[], RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueDhcpActivePools),
      providesTags: [{ type: 'VenueTemplate', id: 'DHCP_POOL_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'DeactivateVenueTemplateDhcpPool',
            'ActivateVenueTemplateDhcpPool',
            'UpdateVenueTemplateDhcpConfigServiceProfileSetting'
          ]
          onActivityMessageReceived(msg, activities, () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'DHCP_POOL_LIST' }]))
          })
        })
      }
    }),
    activateVenueTemplateDhcpPool: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.activateVenueDhcpPool)
    }),
    deactivateVenueTemplateDhcpPool: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.deactivateVenueDhcpPool)
    }),
    getVenueTemplateCityList: build.query<{ name: string }[], RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueCityList),
      transformResponse: (result: { cityList: { name: string }[] }) => {
        return result.cityList
      }
    }),
    getVenueTemplateSwitchSetting: build.query<VenueSwitchConfiguration, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueSwitchSetting, {
        rbacApiVersionKey: ApiVersionEnum.v1_1
      })
    }),
    updateVenueTemplateSwitchSetting: build.mutation<Venue, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueSwitchSetting, {
        rbacApiVersionKey: ApiVersionEnum.v1_1
      })
    }),
    getVenueTemplateSwitchAaaSetting: build.query<AAASetting, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueSwitchAaaSetting, {
        rbacApiVersionKey: ApiVersionEnum.v1_1
      }),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueSwitchAaaSetting, {
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'DETAIL' }]
    }),
    // eslint-disable-next-line max-len
    getVenueTemplateSwitchAAAServerList: build.query<TableResult<RadiusServer | TacacsServer | LocalUser>, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueSwitchAaaServerList, {
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
      providesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    // eslint-disable-next-line max-len
    deleteVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.deleteVenueSwitchAaaServer, {
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    bulkDeleteVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.bulkDeleteVenueSwitchAaaServer, {
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    addVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.addVenueSwitchAaaServer, {
        rbacApiVersionKey: ApiVersionEnum.v1_1
      }),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueSwitchAaaServer, {
        rbacApiVersionKey: ApiVersionEnum.v1_1
      }),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
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
  useGetVenueTemplateCityListQuery,
  useGetVenueTemplateSwitchSettingQuery,
  useUpdateVenueTemplateSwitchSettingMutation,
  useGetVenueTemplateSwitchAaaSettingQuery,
  useUpdateVenueTemplateSwitchAAASettingMutation,
  useGetVenueTemplateSwitchAAAServerListQuery,
  useDeleteVenueTemplateSwitchAAAServerMutation,
  useBulkDeleteVenueTemplateSwitchAAAServerMutation,
  useAddVenueTemplateSwitchAAAServerMutation,
  useUpdateVenueTemplateSwitchAAAServerMutation
} = venueConfigTemplateApi
