/* eslint-disable max-len */
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
  ApiVersionEnum,
  PoliciesConfigTemplateUrlsInfo,
  EthernetPortProfileViewData,
  VenueLanPortSettings
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'

import { commonQueryFn, getVenueDHCPProfileFn, transformGetVenueDHCPPoolsResponse } from '../servicePolicy.utils'
import { handleCallbackWhenActivitySuccess }                                        from '../utils'
import {
  createVenueDefaultRadioCustomizationFetchArgs,
  createVenueDefaultRegulatoryChannelsFetchArgs,
  createVenueRadioCustomizationFetchArgs,
  createVenueUpdateRadioCustomizationFetchArgs,
  mappingLanPortWithEthernetPortProfile
} from '../venue.utils'

import { configTemplateApi }                  from './common'
import { useCasesToRefreshVenueTemplateList } from './constants'

export const venueConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    addVenueTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.addVenueTemplate),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    deleteVenueTemplate: build.mutation<Venue, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.deleteVenueTemplate),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    updateVenueTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(VenueConfigTemplateUrlsInfo.updateVenueTemplate),
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
            api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
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
    getVenueTemplateDefaultRegulatoryChannels: build.query<VenueDefaultRegulatoryChannels, RequestPayload>({
      query: createVenueDefaultRegulatoryChannelsFetchArgs(true)
    }),
    getVenueTemplateDefaultRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: createVenueDefaultRadioCustomizationFetchArgs(true)
    }),
    getVenueTemplateRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: createVenueRadioCustomizationFetchArgs(true),
      providesTags: [{ type: 'VenueTemplateRadio', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateVenueTemplateRadioCustomization'], () => {
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
          await handleCallbackWhenActivitySuccess(api, msg, 'UpdateVenueTemplateLoadBalancing', requestArgs.callback)
        })
      }
    }),
    getVenueTemplateClientAdmissionControl: build.query<VenueClientAdmissionControl, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueClientAdmissionControl,
        VenueConfigTemplateUrlsInfo.getVenueClientAdmissionControlRbac
      ),
      providesTags: [{ type: 'VenueTemplate', id: 'ClientAdmissionControl' }]
    }),
    updateVenueTemplateClientAdmissionControl: build.mutation<VenueClientAdmissionControl, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueClientAdmissionControl,
        VenueConfigTemplateUrlsInfo.updateVenueClientAdmissionControlRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'ClientAdmissionControl' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
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
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'WIFI_SETTINGS' }]))
          })
        })
      }
    }),
    // only exist in v1(RBAC version)
    getVenueTemplateMesh: build.query<Mesh, RequestPayload>({
      query: ({ params, isWifiMeshIndependents56GEnable }) => {
        const customHeaders = GetApiVersionHeader(isWifiMeshIndependents56GEnable? ApiVersionEnum.v1_1 :ApiVersionEnum.v1)
        return {
          ...createHttpRequest(VenueConfigTemplateUrlsInfo.getVenueMeshRbac, params, customHeaders)
        }
      },
      providesTags: [{ type: 'VenueTemplate', id: 'VENUE_MESH_SETTINGS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateVenueTemplateApMeshSettings'], () => {
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
    getDefaultVenueTemplateLanPorts: build.query<VenueLanPorts[], RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        return {
          ...createHttpRequest(VenueConfigTemplateUrlsInfo.getDefaultVenueLanPortsRbac, params, customHeaders)
        }
      }
    }),
    getVenueTemplateLanPorts: build.query<VenueLanPorts[], RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueLanPorts,
        VenueConfigTemplateUrlsInfo.getVenueLanPortsRbac
      )
    }),
    getVenueTemplateLanPortWithEthernetSettings: build.query<VenueLanPorts[], RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { params } = arg
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const venueLanPortsQuery = await fetchWithBQ(
          createHttpRequest(VenueConfigTemplateUrlsInfo.getVenueLanPortsRbac, params, apiCustomHeader)
        )
        const venueLanPortSettings = venueLanPortsQuery.data as VenueLanPorts[]
        const venueId = arg.params?.venueId

        if (venueId) {
          // Mapping Ethernet port profile relation to Lan port settings
          const ethernetPortProfileReq = createHttpRequest(PoliciesConfigTemplateUrlsInfo.getEthernetPortProfileViewDataList)
          const ethernetPortProfileQuery = await fetchWithBQ(
            { ...ethernetPortProfileReq,
              body: JSON.stringify({
                filters: {
                  venueIds: [venueId]
                }
              })
            }
          )
          const ethernetPortProfiles = (ethernetPortProfileQuery.data as TableResult<EthernetPortProfileViewData>).data
          mappingLanPortWithEthernetPortProfile(venueLanPortSettings, ethernetPortProfiles, venueId)

          /*
           *  Ethernet port Template doesn't support softGRE and client-Isolation now
           *

          const {
            isEthernetPortProfileEnabled=false,
            isEthernetSoftgreEnabled=false,
            isEthernetClientIsolationEnabled=false
           } = (arg.payload ?? {}) as {
            isEthernetPortProfileEnabled?: boolean,
            isEthernetSoftgreEnabled?: boolean,
            isEthernetClientIsolationEnabled?: boolean }

          // Mapping SoftGRE profile relation to Lan port settings
          if(isEthernetPortProfileEnabled && isEthernetSoftgreEnabled) {
            const softgreProfileReq = createHttpRequest(SoftGreUrls.getSoftGreViewDataList)
            const softgreProfileQuery = await fetchWithBQ(
              { ...softgreProfileReq,
                body: JSON.stringify({
                  filters: {
                    'venueActivations.venueId': [venueId]
                  }
                })
              }
            )
            const softgreProfiles = (softgreProfileQuery.data as TableResult<SoftGreViewData>).data
            mappingLanPortWithSoftGreProfile(venueLanPortSettings, softgreProfiles, venueId)
          }

          // Mapping Client Isolation Policy relation to Lan port settings
          if(isEthernetClientIsolationEnabled) {
            const clientIsolationReq = createHttpRequest(ClientIsolationUrls.queryClientIsolation)
            const clientIsolationQuery = await fetchWithBQ(
              { ...clientIsolationReq,
                body: JSON.stringify({
                  filters: {
                    'venueActivations.venueId': [venueId]
                  }
                })
              }
            )
            const clientIsolationPolicies = (clientIsolationQuery.data as TableResult<ClientIsolationViewModel>).data
            mappingLanPortWithClientIsolationPolicy(venueLanPortSettings, clientIsolationPolicies, venueId)
          }
          */
        }
        return { data: venueLanPortSettings }
      }
    }),
    getVenueTemplateLanportSettingsByModel: build.query<VenueLanPortSettings[], RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {

        const { venueId, apModel,lanPortCount=0 } = arg.params ?? {}

        const venueLanPortSettingsQuery = Array.from({ length: Number(lanPortCount) }, (_, index) =>{
          const params = { venueId, apModel, portId: (index + 1).toString() }
          return fetchWithBQ(
            createHttpRequest(
              PoliciesConfigTemplateUrlsInfo.getEthernetPortSettingsByVenueApModel,
              params
            )
          )
        })

        const reqs = await Promise.allSettled(venueLanPortSettingsQuery)
        const results: VenueLanPortSettings[] = reqs.map((result) => {
          return result.status === 'fulfilled' ? result.value.data as VenueLanPortSettings : {}
        })

        return { data: results }
      }
    }),
    updateVenueTemplateLanPorts: build.mutation<VenueLanPorts[], RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueLanPorts,
        VenueConfigTemplateUrlsInfo.updateVenueLanPortsRbac
      )
    }),
    updateVenueTemplateLanPortSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          PoliciesConfigTemplateUrlsInfo.updateEthernetPortSettingsByVenueApModel, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    updateVenueTemplateLanPortSpecificSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          VenueConfigTemplateUrlsInfo.updateVenueLanPortSpecificSettings, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    activateTemplateEthernetPortProfileOnVenueApModelPortId: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          PoliciesConfigTemplateUrlsInfo.activateEthernetPortProfileOnVenueApModelPortId,
          params,
          customHeaders
        )
        return {
          ...req
        }
      }
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
          onActivityMessageReceived(msg,
            ['UpdateVenueTemplateDhcpConfigServiceProfileSetting',
              'ActivateDhcpConfigServiceProfileTemplateAndUpdateSettings',
              'DeactivateDhcpConfigServiceProfileTemplate'
            ], () => {
              api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'DHCP_PROFILE' }]))
            })
        })
      }

    }),
    updateVenueTemplateDhcpProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac, enableService }) => {
        const url = !enableRbac ?
          VenueConfigTemplateUrlsInfo.updateVenueDhcpProfile :
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
    getVenueTemplateApModelBandModeSettings: build.query<VenueApModelBandModeSettings[], RequestPayload<void>>({
      query: ({ params }) => {
        return createHttpRequest(VenueConfigTemplateUrlsInfo.getVenueApModelBandModeSettings, params)
      },
      providesTags: [{ type: 'VenueTemplate', id: 'BandModeSettings' }]
    }),
    updateVenueTemplateApModelBandModeSettings: build.mutation<CommonResult, RequestPayload<VenueApModelBandModeSettings[]>>({
      query: ({ params, payload }) => {
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
    getVenueTemplateSwitchAAAServerList: build.query<TableResult<RadiusServer | TacacsServer | LocalUser>, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.getVenueSwitchAaaServerList,
        VenueConfigTemplateUrlsInfo.getVenueSwitchAaaServerListRbac
      ),
      providesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    deleteVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.deleteVenueSwitchAaaServer,
        VenueConfigTemplateUrlsInfo.deleteVenueSwitchAaaServerRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
    }),
    bulkDeleteVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.bulkDeleteVenueSwitchAaaServer,
        VenueConfigTemplateUrlsInfo.bulkDeleteVenueSwitchAaaServerRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
    }),
    addVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.addVenueSwitchAaaServer,
        VenueConfigTemplateUrlsInfo.addVenueSwitchAaaServerRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
    }),
    updateVenueTemplateSwitchAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: commonQueryFn(
        VenueConfigTemplateUrlsInfo.updateVenueSwitchAaaServer,
        VenueConfigTemplateUrlsInfo.updateVenueSwitchAaaServerRbac
      ),
      invalidatesTags: [{ type: 'VenueTemplateSwitchAAA', id: 'LIST' }]
    }),
    getVenueTemplateApSmartMonitorSettings: build.query<VenueApSmartMonitor, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(VenueConfigTemplateUrlsInfo.getVenueApSmartMonitorSettings, params)
      },
      providesTags: [{ type: 'VenueTemplate', id: 'SmartMonitorSettings' }]
    }),
    updateVenueTemplateApSmartMonitorSettings: build.mutation<CommonResult, RequestPayload<VenueApSmartMonitor>>({
      query: ({ params, payload }) => {
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
        return createHttpRequest(VenueConfigTemplateUrlsInfo.getVenueApIotSettings, params)
      },
      providesTags: [{ type: 'VenueTemplate', id: 'IotSettings' }]
    }),
    updateVenueTemplateApIotSettings: build.mutation<CommonResult, RequestPayload<VenueIot>>({
      query: ({ params, payload }) => {
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
        return createHttpRequest(VenueConfigTemplateUrlsInfo.getVenueApRebootTimeoutSettings, params)
      },
      providesTags: [{ type: 'VenueTemplate', id: 'RebootTimeoutSettings' }]
    }),
    updateVenueTemplateApRebootTimeoutSettings: build.mutation<CommonResult, RequestPayload<VenueApRebootTimeout>>({
      query: ({ params, payload }) => {
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
  useGetDefaultVenueTemplateLanPortsQuery,
  useGetVenueTemplateLanPortsQuery,
  useGetVenueTemplateLanPortWithEthernetSettingsQuery,
  useLazyGetVenueTemplateLanportSettingsByModelQuery,
  useUpdateVenueTemplateLanPortsMutation,
  useUpdateVenueTemplateLanPortSettingsMutation,
  useUpdateVenueTemplateLanPortSpecificSettingsMutation,
  useActivateTemplateEthernetPortProfileOnVenueApModelPortIdMutation,
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
