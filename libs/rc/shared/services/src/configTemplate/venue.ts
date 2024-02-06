import {
  CapabilitiesApModel, CommonResult, ExternalAntenna, TriBandSettings,
  VenueBssColoring,
  VenueClientAdmissionControl, VenueConfigTemplateUrlsInfo,
  VenueDefaultRegulatoryChannels, VenueDirectedMulticast,
  VenueDosProtection, VenueLanPorts, VenueLoadBalancing,
  VenueMdnsFencingPolicy,
  VenueRadioCustomization, VenueRadiusOptions, VenueSettings,
  onActivityMessageReceived, onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'

import { handleCallbackWhenActivitySuccess } from '../utils'

import { commonQueryFn } from './common'

export const venueConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    // eslint-disable-next-line max-len
    getVenueTemplateApCapabilities: build.query<{ version: string, apModels: CapabilitiesApModel[] }, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueApCapabilities)
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueDefaultRegulatoryChannels)
    }),
    // eslint-disable-next-line max-len
    getVenueTemplateDefaultRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getDefaultRadioCustomization)
    }),
    getVenueTemplateRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueRadioCustomization),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueRadioCustomization),
      invalidatesTags: [{ type: 'VenueTemplateRadio', id: 'LIST' }]
    }),
    getVenueTemplateLoadBalancing: build.query<VenueLoadBalancing, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueLoadBalancing),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueLoadBalancing),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'LOAD_BALANCING' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          // eslint-disable-next-line max-len
          await handleCallbackWhenActivitySuccess(requestArgs, api, msg, 'UpdateVenueTemplateLoadBalancing')
        })
      }
    }),
    // eslint-disable-next-line max-len
    getVenueTemplateClientAdmissionControl: build.query<VenueClientAdmissionControl, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueClientAdmissionControl),
      providesTags: [{ type: 'VenueTemplate', id: 'ClientAdmissionControl' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueTemplateClientAdmissionControl: build.mutation<VenueClientAdmissionControl, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueClientAdmissionControl),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'ClientAdmissionControl' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          // eslint-disable-next-line max-len
          await handleCallbackWhenActivitySuccess(requestArgs, api, msg, 'UpdateVenueTemplateClientAdmissionControlSettings')
        })
      }
    }),
    getVenueTemplateExternalAntenna: build.query<ExternalAntenna[], RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueExternalAntenna),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueExternalAntenna),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueMesh),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'WIFI_SETTINGS' }]
    }),
    getVenueTemplateLanPorts: build.query<VenueLanPorts[], RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueLanPorts)
    }),
    updateVenueTemplateLanPorts: build.mutation<VenueLanPorts[], RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueLanPorts)
    }),
    getVenueTemplateDirectedMulticast: build.query<VenueDirectedMulticast, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueDirectedMulticast),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueDirectedMulticast),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'DIRECTEDMULTICAST' }]
    }),
    getVenueTemplateRadiusOptions: build.query<VenueRadiusOptions, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueRadiusOptions),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueRadiusOptions),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'RADIUS_OPTIONS' }]
    }),
    getVenueTemplateDoSProtection: build.query<VenueDosProtection, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getDenialOfServiceProtection)
    }),
    updateVenueTemplateDoSProtection: build.mutation<VenueDosProtection, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateDenialOfServiceProtection)
    }),
    getVenueTemplateMdnsFencing: build.query<VenueMdnsFencingPolicy, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueMdnsFencingPolicy),
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
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueMdnsFencingPolicy),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'MDNS_FENCING' }]
    }),
    getVenueTemplateBssColoring: build.query<VenueBssColoring, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueBssColoring)
    }),
    updateVenueTemplateBssColoring: build.mutation<VenueBssColoring, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueBssColoring)
    })
  })
})

export const {
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
  useUpdateVenueTemplateBssColoringMutation
} = venueConfigTemplateApi
