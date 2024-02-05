import {
  CapabilitiesApModel, ExternalAntenna, TriBandSettings,
  VenueBssColoring,
  VenueClientAdmissionControl, VenueConfigTemplateUrlsInfo,
  VenueDefaultRegulatoryChannels, VenueDirectedMulticast,
  VenueDosProtection, VenueLanPorts, VenueLoadBalancing,
  VenueRadioCustomization, VenueRadiusOptions, VenueSettings,
  onActivityMessageReceived, onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'

import { commonQueryFn } from './common'

export const venueConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    // eslint-disable-next-line max-len
    getVenueTemplateApCapabilities: build.query<{ version: string, apModels: CapabilitiesApModel[] }, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueApCapabilities)
    }),
    getVenueTemplateTripleBandRadioSettings: build.query<TriBandSettings, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueTripleBandRadioSettings)
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
    // eslint-disable-next-line max-len
    getVenueTemplateClientAdmissionControl: build.query<VenueClientAdmissionControl, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueClientAdmissionControl),
      providesTags: [{ type: 'VenueTemplate', id: 'ClientAdmissionControl' }]
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
    getVenueTemplateLanPorts: build.query<VenueLanPorts[], RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueLanPorts)
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
    getVenueTemplateRadiusOptions: build.query<VenueRadiusOptions, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueRadiusOptions),
      providesTags: [{ type: 'VenueTemplate', id: 'RADIUS_OPTIONS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateVenueRadiusOptions'], () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'RADIUS_OPTIONS' }]))
          })
        })
      }
    }),
    getVenueTemplateDoSProtection: build.query<VenueDosProtection, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getDenialOfServiceProtection)
    }),
    getVenueTemplateBssColoring: build.query<VenueBssColoring, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.getVenueBssColoring)
    })
  })
})

export const {
  useGetVenueTemplateApCapabilitiesQuery,
  useGetVenueTemplateTripleBandRadioSettingsQuery,
  useGetVenueTemplateDefaultRegulatoryChannelsQuery,
  useGetVenueTemplateDefaultRadioCustomizationQuery,
  useGetVenueTemplateRadioCustomizationQuery,
  useGetVenueTemplateLoadBalancingQuery,
  useGetVenueTemplateClientAdmissionControlQuery,
  useGetVenueTemplateExternalAntennaQuery,
  useGetVenueTemplateSettingsQuery,
  useGetVenueTemplateLanPortsQuery,
  useGetVenueTemplateDirectedMulticastQuery,
  useGetVenueTemplateRadiusOptionsQuery,
  useGetVenueTemplateDoSProtectionQuery,
  useGetVenueTemplateBssColoringQuery
} = venueConfigTemplateApi
