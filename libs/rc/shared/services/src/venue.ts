/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { FetchBaseQueryError }   from '@reduxjs/toolkit/query/react'
import { cloneDeep, omit, uniq } from 'lodash'

import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  CommonUrlsInfo,
  DHCPUrls,
  WifiUrlsInfo,
  SwitchUrlsInfo,
  SwitchRbacUrlsInfo,
  FloorPlanDto,
  onSocketActivityChanged,
  onActivityMessageReceived,
  TableResult,
  Venue,
  VenueExtended,
  VenueDetailHeader,
  APMesh,
  Capabilities,
  VenueLed,
  VenueApModelBandModeSettings,
  VenueApModels,
  ExternalAntenna,
  CapabilitiesApModel,
  VenueLanPorts,
  VenueDosProtection,
  VenueRogueAp,
  RogueClassificationPolicy,
  VenueSyslog,
  RadiusServer,
  TacacsServer,
  LocalUser,
  AAASetting,
  CommonResult,
  NetworkVenue,
  VenueSettings,
  VenueSwitchConfiguration,
  ConfigurationProfile,
  ConfigurationHistory,
  transformConfigType,
  transformConfigStatus,
  VenueConfigHistoryDetailResp,
  VenueDHCPProfile,
  VenueDHCPPoolInst,
  DHCPLeases,
  VenueDefaultRegulatoryChannels,
  TriBandSettings,
  AvailableLteBands,
  VenueApModelCellular,
  UploadUrlResponse,
  NetworkDeviceResponse,
  NetworkDevicePayload,
  RogueOldApResponseType,
  VenueRadioCustomization,
  VenueDirectedMulticast,
  VenueLoadBalancing,
  VenueBssColoring,
  TopologyData,
  VenueMdnsFencingPolicy,
  PropertyConfigs,
  PropertyUrlsInfo,
  PropertyUnit,
  NewTableResult,
  transferToTableResult,
  downloadFile,
  RequestFormData,
  VenueRadiusOptions,
  ApMeshTopologyData,
  FloorPlanMeshAP,
  VenueClientAdmissionControl,
  RogueApLocation,
  ApManagementVlan,
  ApEnhancedKey,
  ApCompatibility,
  ApCompatibilityResponse,
  VeuneApAntennaTypeSettings,
  NetworkApGroup,
  ConfigTemplateUrlsInfo,
  getVenueTimeZone,
  getCurrentTimeSlotIndex,
  SchedulerTypeEnum,
  ISlotIndex,
  Network,
  ITimeZone,
  WifiRbacUrlsInfo,
  GetApiVersionHeader,
  CommonRbacUrlsInfo,
  ApiVersionEnum,
  ApiVersionEnum
} from '@acx-ui/rc/utils'
import { baseVenueApi }                        from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

import { handleCallbackWhenActivitySuccess } from './utils'

const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

const customHeaders = {
  v1: {
    'Content-Type': 'application/vnd.ruckus.v1+json',
    'Accept': 'application/vnd.ruckus.v1+json'
  },
  v1001: {
    'Content-Type': 'application/vnd.ruckus.v1.1+json',
    'Accept': 'application/vnd.ruckus.v1.1+json'
  }
}

export const venueApi = baseVenueApi.injectEndpoints({
  endpoints: (build) => ({
    venuesList: build.query<TableResult<Venue>, RequestPayload>({
      query: ({ params, payload }: RequestPayload) => {
        const venueListReq = createHttpRequest(
          (payload as { isTemplate?: boolean })?.isTemplate ?? false
            ? ConfigTemplateUrlsInfo.getVenuesTemplateList
            : CommonUrlsInfo.getVenuesList,
          params
        )
        return {
          ...venueListReq,
          body: payload
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddVenue',
            'UpdateVenue',
            'DeleteVenue',
            'DeleteVenues',
            'UpdateVenueRogueAp',
            'AddRoguePolicy',
            'UpdateRoguePolicy',
            'UpdateDenialOfServiceProtection'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    venuesTable: build.query<TableResult<Venue>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const venueListReq = {
          ...createHttpRequest(CommonUrlsInfo.getVenuesList, arg.params),
          body: arg.payload
        }
        const venueListQuery = await fetchWithBQ(venueListReq)
        const venueList = venueListQuery.data as TableResult<Venue>
        const venueIds = venueList?.data?.map(v => v.id) || []
        const venueIdsToIncompatible:{ [key:string]: number } = {}
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allApCompatibilitiesQuery:any = await Promise.all(venueIds.map(id => {
            const apCompatibilitiesReq = {
              ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesVenue, { venueId: id }),
              body: { filters: {} }
            }
            return fetchWithBQ(apCompatibilitiesReq)
          }))
          venueIds.forEach((id:string, index:number) => {
            const allApCompatibilitiesResponse = allApCompatibilitiesQuery[index]?.data as ApCompatibilityResponse
            const allApCompatibilitiesData = allApCompatibilitiesResponse?.apCompatibilities as ApCompatibility[]
            venueIdsToIncompatible[id] = allApCompatibilitiesData[0]?.incompatible ?? 0
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('venuesTable getApCompatibilitiesVenue error:', e)
        }
        const aggregatedList = aggregatedVenueCompatibilitiesData(
          venueList, venueIdsToIncompatible)

        return venueListQuery.data
          ? { data: aggregatedList }
          : { error: venueListQuery.error as FetchBaseQueryError }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddVenue',
            'UpdateVenue',
            'DeleteVenue',
            'DeleteVenues',
            'UpdateVenueRogueAp',
            'AddRoguePolicy',
            'UpdateRoguePolicy',
            'UpdateDenialOfServiceProtection'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    addVenue: build.mutation<VenueExtended, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.addVenue, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    getTimezone: build.query<ITimeZone, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getTimezone, params)
        return{
          ...req
        }
      }
    }),
    getVenue: build.query<VenueExtended, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenue, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'DETAIL' }]
    }),
    getVenues: build.query<{ data: Venue[] }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenues, params)
        return{
          ...req,
          body: payload
        }
      }
    }),
    updateVenue: build.mutation<VenueExtended, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenue, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    venueDetailsHeader: build.query<VenueDetailHeader, RequestPayload>({
      query: ({ params }) => {
        const venueDetailReq = createHttpRequest(CommonUrlsInfo.getVenueDetailsHeader, params)
        return {
          ...venueDetailReq
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Venue', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const USE_CASES = [
            'AddNetworkVenue',
            'DeleteNetworkVenue'
          ]
          const CONFIG_TEMPLATE_USE_CASES = [
            'DeleteNetworkVenueTemplate',
            'AddNetworkVenueTemplate',
            'UpdateNetworkVenueTemplate'
          ]
          const useCases = (requestArgs.payload as { isTemplate?: boolean })?.isTemplate ? CONFIG_TEMPLATE_USE_CASES : USE_CASES
          onActivityMessageReceived(msg, useCases, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'DETAIL' }]))
          })
        })
      }
    }),
    getVenueCityList: build.query<{ name: string }[], RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(CommonUrlsInfo.getVenueCityList, params, headers)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      transformResponse: (result: { cityList: { name: string }[] }) => {
        return result.cityList
      }
    }),
    getVenueSettings: build.query<VenueSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueSettings, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'WIFI_SETTINGS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateMeshOptions'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'WIFI_SETTINGS' }]))
          })
        })
      }
    }),
    updateVenueMesh: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateVenueMesh, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'WIFI_SETTINGS' }]
    }),
    updateVenueCellularSettings: build.mutation<VenueApModelCellular[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueCellularSettings, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    meshAps: build.query<TableResult<APMesh>, RequestPayload>({
      query: ({ params, payload }) => {
        const venueMeshReq = createHttpRequest(CommonUrlsInfo.getMeshAps, params)
        return {
          ...venueMeshReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Device', id: 'MESH' }],
      extraOptions: { maxRetries: 5 }
    }),
    getFloorPlanMeshAps: build.query<TableResult<FloorPlanMeshAP>, RequestPayload>({
      query: ({ params, payload }) => {
        const venueMeshReq = createHttpRequest(CommonUrlsInfo.getMeshAps, params)
        return {
          ...venueMeshReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Device', id: 'MESH' }, { type: 'VenueFloorPlan', id: 'DEVICE' }]
    }),
    deleteVenue: build.mutation<Venue, RequestPayload>({
      query: ({ params, payload }) => {
        if (payload) { //delete multiple rows
          let req = createHttpRequest(CommonUrlsInfo.deleteVenues, params)
          return {
            ...req,
            body: payload
          }
        } else { //delete single row
          let req = createHttpRequest(CommonUrlsInfo.deleteVenue, params)
          return {
            ...req
          }
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    getNetworkApGroups: build.query<NetworkVenue[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.venueNetworkApGroup, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (result: CommonResult) => {
        return result.response as NetworkVenue[]
      }
    }),
    getNetworkApGroupsV2: build.query<NetworkVenue[], RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {

        const payloadData = arg.payload as { venueId: string, networkId: string }[]
        const filters = payloadData.map(item => ({
          venueId: item.venueId,
          networkId: item.networkId
        }))

        const venueIds = uniq(filters.map(item => item.venueId))
        let venueApgroupMap = new Map<string, NetworkApGroup[]>()
        let networkVenuesApGroupList = {} as { data: NetworkVenue[] }

        for (let venueId of venueIds) {
          // get apGroup list filter by venueId
          const apGroupPayload = {
            fields: ['name', 'id'],
            pageSize: 10000,
            sortField: 'name',
            sortOrder: 'ASC',
            filters: { venueId: [venueId] }
          }

          const apGroupListInfo = {
            ...createHttpRequest(WifiUrlsInfo.getApGroupsList, arg.params),
            body: apGroupPayload
          }

          const apGroupsQuery = await fetchWithBQ(apGroupListInfo)
          const apGroupListData = apGroupsQuery.data as {
            data: {
              id: string,
              name: string
            }[]
          }

          const apgroupsDefaultValue = apGroupListData.data.map((d) => {
            return {
              apGroupId: d.id,
              ...(d.name && { apGroupName: d.name }),
              isDefault: !d.name,
              radio: 'Both',
              radioTypes: ['2.4-GHz', '5-GHz'],
              validationError: false,
              validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
              validationErrorReachedMaxConnectedNetworksLimit: false,
              validationErrorSsidAlreadyActivated: false
            } as NetworkApGroup
          })

          venueApgroupMap.set(venueId, apgroupsDefaultValue)
        }

        const apiV2CustomHeader = {
          'Content-Type': 'application/vnd.ruckus.v2+json',
          'Accept': 'application/vnd.ruckus.v2+json'
        }

        const networkVenuesApGroupInfo = {
          ...createHttpRequest(CommonUrlsInfo.networkActivations, arg.params, apiV2CustomHeader),
          body: JSON.stringify({ filters })
        }

        const networkVenuesApGroupQuery = await fetchWithBQ(networkVenuesApGroupInfo)
        networkVenuesApGroupList = networkVenuesApGroupQuery.data as { data: NetworkVenue[] }

        let aggregatedList: NetworkVenue[] | undefined

        if (filters.length === 1 && !filters[0].networkId ) { // for create Netwrok
          const venueId = filters[0].venueId
          const networkVenueData = networkVenuesApGroupList.data?.[0]
          const networkVenue = omit(networkVenueData, ['networkId', 'id'])

          aggregatedList = [{
            ...networkVenue,
            apGroups: cloneDeep(venueApgroupMap.get(venueId))
          }]

        } else {
          aggregatedList = networkVenuesApGroupList.data?.map(networkVenue => {
            const { venueId, apGroups=[] } = networkVenue
            const currentApGroupsDefaultValue = venueApgroupMap.get(venueId!)

            const newApgroups = cloneDeep(apGroups)

            currentApGroupsDefaultValue?.forEach(apGroup => {
              const customApGroup = apGroups.find(item => item.apGroupId === apGroup.apGroupId)
              if (!customApGroup) {
                newApgroups.push(cloneDeep(apGroup))
              }
            })

            return {
              ...networkVenue,
              apGroups: newApgroups
            }
          })
        }

        return networkVenuesApGroupQuery.data
          ? { data: aggregatedList }
          : { error: networkVenuesApGroupQuery.error as FetchBaseQueryError }
      }
    }),
    getFloorPlan: build.query<FloorPlanDto, RequestPayload>({
      query: ({ params }) => {
        const floorPlansReq = createHttpRequest(CommonUrlsInfo.getFloorplan, params)
        return {
          ...floorPlansReq
        }
      },
      transformResponse (result: FloorPlanDto) {
        return result
      }
    }),
    floorPlanList: build.query<FloorPlanDto[], RequestPayload>({
      query: ({ params }) => {
        const floorPlansReq = createHttpRequest(CommonUrlsInfo.getVenueFloorplans, params)
        return {
          ...floorPlansReq
        }
      },
      providesTags: [{ type: 'VenueFloorPlan', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['AddFloorPlan', 'UpdateFloorPlan', 'DeleteFloorPlan'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'VenueFloorPlan', id: 'DETAIL' }]))
            })
        })
      }
    }),
    deleteFloorPlan: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.deleteFloorPlan, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DETAIL' }]
    }),
    addFloorPlan: build.mutation<FloorPlanDto, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.addFloorplan,
          params)
        return {
          ...req,
          headers: {
            ...req.headers,
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json; charset=UTF-8'
          },
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DETAIL' }]
    }),
    getUploadURL: build.mutation<UploadUrlResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const request = createHttpRequest(CommonUrlsInfo.getUploadURL, params)
        return {
          ...request,
          body: payload
        }
      }
    }),
    getVenueSpecificUploadURL: build.mutation<UploadUrlResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const request = createHttpRequest(CommonUrlsInfo.getVenueSpecificUploadURL, params)
        return {
          ...request,
          body: payload
        }
      }
    }),
    updateFloorPlan: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateFloorplan, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DETAIL' }]
    }),
    getAllDevices: build.query<NetworkDeviceResponse, RequestPayload<NetworkDevicePayload>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getAllDevices, params)
        return {
          ...req,
          body: payload as NetworkDevicePayload
        }
      },
      providesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateSwitchPosition',
            'UpdateApPosition',
            'UpdateCloudpathServerPosition',
            'DeleteFloorPlan'], () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'VenueFloorPlan', id: 'DEVICE' }]))
          })
        })
      }
    }),
    updateSwitchPosition: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.UpdateSwitchPosition, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' }]
    }),
    updateApPosition: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.UpdateApPosition, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' }]
    }),
    updateCloudpathServerPosition: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.UpdateCloudpathServerPosition, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' }]
    }),
    getVenueCapabilities: build.query<Capabilities, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueApCapabilities, params)
        return{
          ...req
        }
      }
    }),
    getApCompatibilitiesVenue: build.query<ApCompatibilityResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApCompatibilitiesVenue, params, { ...ignoreErrorModal })
        return{
          ...req,
          body: payload
        }
      }
    }),
    getVenueApModels: build.query<VenueApModels, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueApModels, params)
        return{
          ...req
        }
      }
    }),
    getVenueLedOn: build.query<VenueLed[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenueLedOn, params, apiCustomHeader)
        return{
          ...req
        }
      }
    }),
    updateVenueLedOn: build.mutation<VenueLed[], RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const apiInfo = enableRbac ? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(apiInfo.updateVenueLedOn, params, apiCustomHeader)
        return {
          ...req,
          body: enableRbac? JSON.stringify(payload) : payload
        }
      }
    }),
    // eslint-disable-next-line max-len
    getVenueApModelBandModeSettings: build.query<VenueApModelBandModeSettings[], RequestPayload<void>>({
      query: ({ params }) =>
        createHttpRequest(CommonUrlsInfo.getVenueApModelBandModeSettings, params),
      providesTags: [{ type: 'Venue', id: 'BandModeSettings' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueApModelBandModeSettings: build.mutation<CommonResult, RequestPayload<VenueApModelBandModeSettings[]>>({
      query: ({ params, payload }) => ({
        ...createHttpRequest(CommonUrlsInfo.updateVenueApModelBandModeSettings, params),
        body: payload
      }),
      invalidatesTags: [{ type: 'Venue', id: 'BandModeSettings' }]
    }),
    getVenueLanPorts: build.query<VenueLanPorts[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueLanPorts, params)
        return{
          ...req
        }
      }
    }),
    updateVenueLanPorts: build.mutation<VenueLanPorts[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenueLanPorts, params)
        return{
          ...req,
          body: payload
        }
      }
    }),
    getAvailableLteBands: build.query<AvailableLteBands[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getAvailableLteBands, params)
        return{
          ...req
        }
      }
    }),
    getVenueApModelCellular: build.query<VenueApModelCellular, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueApModelCellular, params)
        return{
          ...req
        }
      }
    }),
    configProfiles: build.query<ConfigurationProfile[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getConfigProfiles, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: { data: ConfigurationProfile[] }) {
        return result?.data
      }
    }),
    venueSwitchSetting: build.query<VenueSwitchConfiguration, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const req = createHttpRequest(CommonUrlsInfo.getVenueSwitchSetting, params, headers)
        return{
          ...req
        }
      }
    }),
    updateVenueSwitchSetting: build.mutation<Venue, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const req = createHttpRequest(CommonUrlsInfo.updateVenueSwitchSetting, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    venueSwitchAAAServerList: build.query<
    TableResult<RadiusServer | TacacsServer | LocalUser>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? SwitchRbacUrlsInfo : SwitchUrlsInfo
        const headers = enableRbac ? customHeaders.v1 : {}
        const listReq = createHttpRequest(urlsInfo.getAaaServerList, params, headers)
        return {
          ...listReq,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'AAA', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getAaaSetting: build.query<AAASetting, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const req = createHttpRequest(SwitchUrlsInfo.getAaaSetting, params, headers)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'AAA', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['AddAaaServer', 'UpdateAaaServer', 'DeleteAaaServer'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'AAA', id: 'LIST' }]))
            })
        })
      }
    }),
    updateAAASetting: build.mutation<AAASetting, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? SwitchRbacUrlsInfo : SwitchUrlsInfo
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(urlsInfo.updateAaaSetting, params, headers)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'DETAIL' }]
    }),
    addAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(SwitchUrlsInfo.addAaaServer, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    updateAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const req = createHttpRequest(SwitchUrlsInfo.updateAaaServer, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    deleteAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? SwitchRbacUrlsInfo : SwitchUrlsInfo
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(urlsInfo.deleteAaaServer, params, headers)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    bulkDeleteAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? SwitchRbacUrlsInfo : SwitchUrlsInfo
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(urlsInfo.bulkDeleteAaaServer, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    getVenueExternalAntenna: build.query<ExternalAntenna[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenueExternalAntenna, params, apiCustomHeader)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'ExternalAntenna', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['UpdateVenueExternalAntenna'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'ExternalAntenna', id: 'LIST' }]))
            })
        })
      }
    }),
    venueDefaultRegulatoryChannels: build.query<VenueDefaultRegulatoryChannels, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueDefaultRegulatoryChannels, params)
        return{
          ...req
        }
      }
    }),
    getDefaultRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getDefaultRadioCustomization, params)
        return{
          ...req
        }
      }
    }),
    getVenueRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueRadioCustomization, params)
        return{
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'VenueRadio', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['UpdateVenueRadioCustomization'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'VenueRadio', id: 'LIST' }]))
            })
        })
      }
    }),
    updateVenueRadioCustomization:
    build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueRadioCustomization, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueRadio', id: 'LIST' }]
    }),
    getVenueTripleBandRadioSettings:
    build.query<TriBandSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueTripleBandRadioSettings, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'TripleBandRadioSettings' }]
    }),
    updateVenueTripleBandRadioSettings:
    build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueTripleBandRadioSettings, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'TripleBandRadioSettings' }]
    }),
    getVenueApCapabilities: build.query<{
      version: string,
      apModels: CapabilitiesApModel[] }, RequestPayload>({
        query: ({ params }) => {
          const req = createHttpRequest(WifiUrlsInfo.getVenueApCapabilities, params)
          return {
            ...req
          }
        },
        providesTags: [{ type: 'ExternalAntenna', id: 'LIST' }]
      }),
    updateVenueExternalAntenna: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateVenueExternalAntenna, params, apiCustomHeader)
        return {
          ...req,
          body: enableRbac? JSON.stringify(payload) : payload
        }
      },
      invalidatesTags: [{ type: 'ExternalAntenna', id: 'LIST' }]
    }),
    getDenialOfServiceProtection: build.query<VenueDosProtection, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
        const req = createHttpRequest(urlsInfo.getDenialOfServiceProtection, params, apiCustomHeader)
        return {
          ...req
        }
      }
    }),
    updateDenialOfServiceProtection: build.mutation<VenueDosProtection, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateDenialOfServiceProtection, params, apiCustomHeader)
        return {
          ...req,
          body: enableRbac? JSON.stringify(payload) : payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    getVenueRogueAp: build.query<VenueRogueAp, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueRogueAp, params)
        return{
          ...req
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueRogueAp',
            'UpdateDenialOfServiceProtection'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      }
    }),
    getRogueApLocation: build.query<RogueApLocation, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getRogueApLocation, params)
        return {
          ...req
        }
      }
    }),
    getOldVenueRogueAp: build.query<TableResult<RogueOldApResponseType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getOldVenueRogueAp, params)
        return{
          ...req,
          body: payload
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    updateVenueRogueAp: build.mutation<VenueRogueAp, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenueRogueAp, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    getRoguePolicies: build.query<RogueClassificationPolicy[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getRoguePolicies, params)
        return{
          ...req
        }
      }
    }),
    updateVenueSyslogAp: build.mutation<VenueSyslog, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenueSyslogAp, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'Syslog' }]
    }),
    venueDHCPProfile: build.query<VenueDHCPProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DHCPUrls.getVenueDHCPServiceProfile, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'DHCPProfile' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueDhcpConfigServiceProfileSetting'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'DHCPProfile' }]))
          })
        })
      }

    }),
    venueDHCPPools: build.query<VenueDHCPPoolInst[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DHCPUrls.getVenueActivePools, params, RKS_NEW_UI)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'poolList' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'DeactivateVenueDhcpPool',
            'ActivateVenueDhcpPool',
            'UpdateVenueDhcpConfigServiceProfileSetting'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'poolList' }]))
          })
        })
      }
    }),
    venuesLeasesList: build.query<DHCPLeases[], RequestPayload>({
      query: ({ params }) => {
        const leasesList = createHttpRequest(DHCPUrls.getVenueLeases, params, RKS_NEW_UI)
        return {
          ...leasesList
        }
      }
    }),
    activateDHCPPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DHCPUrls.activeVenueDHCPPool, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      }
    }),
    deactivateDHCPPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DHCPUrls.deactivateVenueDHCPPool, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateVenueDHCPProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DHCPUrls.updateVenueDHCPProfile, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getVenueDirectedMulticast: build.query<VenueDirectedMulticast, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenueDirectedMulticast, params, apiCustomHeader)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'DIRECTED_MULTICAST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueDirectedMulticast'
          ]
          onActivityMessageReceived(msg, activities, () => {
            const invalidateTagsFunc = venueApi.util.invalidateTags
            api.dispatch(invalidateTagsFunc([{ type: 'Venue', id: 'DIRECTED_MULTICAST' }]))
          })
        })
      }
    }),
    updateVenueDirectedMulticast: build.mutation<VenueDirectedMulticast, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateVenueDirectedMulticast, params, apiCustomHeader)
        return{
          ...req,
          body: enableRbac? JSON.stringify(payload) : payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'DIRECTEDMULTICAST' }]
    }),
    getVenueConfigHistory: build.query<TableResult<ConfigurationHistory>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const req = createHttpRequest(CommonUrlsInfo.getVenueConfigHistory, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      transformResponse: (res: {
        response:{ list:ConfigurationHistory[], totalCount:number }
        } & { list:ConfigurationHistory[], totalCount:number }, meta
      , arg: { payload:{ page:number } }) => {
        const result = res.response?.list || res.list
        const totalCount = res.response?.totalCount || res.totalCount
        const configType = result ? (res.list ? 'historyConfigTypeV1001' : 'configType' ) : 'configType'
        return {
          data: result ? result.map(item => ({
            ...item,
            startTime: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(item.startTime),
            configType: (item[configType] as unknown as string[])
              .map(type => transformConfigType(type)).join(', '),
            dispatchStatus: transformConfigStatus(item.dispatchStatus)
          })) : [],
          totalCount: totalCount,
          page: arg.payload.page
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    getVenueConfigHistoryDetail: build.query<VenueConfigHistoryDetailResp, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const req = createHttpRequest(CommonUrlsInfo.getVenueConfigHistoryDetail, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getVenueLoadBalancing: build.query<VenueLoadBalancing, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getVenueLoadBalancing, params, customHeaders)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'LOAD_BALANCING' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueLoadBalancing'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'LOAD_BALANCING' }]))
          })
        })
      }
    }),
    updateVenueLoadBalancing: build.mutation<VenueLoadBalancing, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateVenueLoadBalancing, params, customHeaders)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LOAD_BALANCING' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivitySuccess(api, msg, 'UpdateVenueLoadBalancing', requestArgs.callback)
        })
      }
    }),
    getVenueBssColoring: build.query<VenueBssColoring, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenueBssColoring, params, apiCustomHeader)
        return{
          ...req
        }
      }
    }),
    updateVenueBssColoring: build.mutation<VenueBssColoring, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateVenueBssColoring, params, apiCustomHeader)
        return{
          ...req,
          body: enableRbac? JSON.stringify(payload) : payload
        }
      }
    }),
    getTopology: build.query<TopologyData, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getTopology, params)

        return {
          ...req
        }
      },
      transformResponse: (result: { data: TopologyData[] }) => {
        return result?.data[0] as TopologyData
      }
    }),
    getApMeshTopology: build.query<ApMeshTopologyData, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getApMeshTopology, params)

        return {
          ...req
        }
      },
      transformResponse: (result: { data: ApMeshTopologyData[] }) => {
        return result?.data[0] as ApMeshTopologyData
      }
    }),
    getVenueMdnsFencing: build.query<VenueMdnsFencingPolicy, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenueMdnsFencingPolicy, params, apiCustomHeader)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'MDNS_FENCING' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueBonjourFencing'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'MDNS_FENCING' }]))
          })
        })
      }
    }),
    updateVenueMdnsFencing: build.mutation<VenueMdnsFencingPolicy, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateVenueMdnsFencingPolicy, params, apiCustomHeader)
        return{
          ...req,
          body: enableRbac? JSON.stringify(payload) : payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'MDNS_FENCING' }]
    }),
    getPropertyConfigs: build.query<PropertyConfigs, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          PropertyUrlsInfo.getPropertyConfigs,
          params,
          { ...ignoreErrorModal, Accept: 'application/hal+json' }
        )
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'PropertyConfigs', id: 'ID' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'ENABLE_PROPERTY',
            'DISABLE_PROPERTY'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'PropertyConfigs', id: 'ID' }]))
          })
        })
      }
    }),
    getQueriablePropertyConfigs: build.query<TableResult<PropertyConfigs>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.getPropertyConfigsQuery, params,
          { Accept: 'application/hal+json' })

        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: NewTableResult<PropertyConfigs>) {
        return transferToTableResult<PropertyConfigs>(result)
      },
      providesTags: [{ type: 'PropertyConfigs', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    updatePropertyConfigs: build.mutation<PropertyConfigs, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.updatePropertyConfigs, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyConfigs', id: 'ID' }]
    }),
    patchPropertyConfigs: build.mutation<PropertyConfigs, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          PropertyUrlsInfo.patchPropertyConfigs,
          params,
          { 'Content-Type': 'application/json-patch+json' })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyConfigs', id: 'ID' }]
    }),
    addPropertyUnit: build.mutation<PropertyUnit, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.addPropertyUnit, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyUnit', id: 'LIST' }]
    }),
    importPropertyUnits: build.mutation<{}, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.importPropertyUnits, params, {
          'Content-Type': undefined,
          'Accept': undefined
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyUnit' }]
    }),

    // eslint-disable-next-line max-len
    getPropertyUnitById: build.query<PropertyUnit, RequestPayload<{ venueId: string, unitId: string }>>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(PropertyUrlsInfo.getUnitById, params, { Accept: 'application/hal+json' })
        return {
          ...req
        }
      },
      providesTags: [{ type: 'PropertyUnit', id: 'ID' }]
    }),
    getPropertyUnitList: build.query<TableResult<PropertyUnit>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          PropertyUrlsInfo.getPropertyUnitList,
          params,
          { Accept: 'application/hal+json' }
        )
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: NewTableResult<PropertyUnit>) {
        return transferToTableResult<PropertyUnit>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'ADD_UNIT',
            'UPDATE_UNIT',
            'DELETE_UNIT',
            'IMPORT_UNIT',
            'UpdatePersona'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([
              { type: 'PropertyUnit', id: 'LIST' },
              { type: 'PropertyUnit', id: 'ID' }
            ]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'PropertyUnit', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    downloadPropertyUnits: build.query<Blob, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.exportPropertyUnits, {
          ...params
        },{
          Accept: 'text/csv'
        })

        return {
          ...req,
          body: payload,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'PropertyUnits.csv'
            downloadFile(response, fileName)
          }
        }
      }
    }),
    updatePropertyUnit: build.mutation<PropertyUnit, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.updatePropertyUnit, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyUnit', id: 'LIST' }]
    }),
    deletePropertyUnits: build.mutation<PropertyUnit, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.deletePropertyUnits, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyUnit', id: 'LIST' }]
    }),
    notifyPropertyUnits: build.mutation<null, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.notifyPropertyUnits, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getVenueRadiusOptions: build.query<VenueRadiusOptions, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenueRadiusOptions, params, apiCustomHeader)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'RADIUS_OPTIONS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueRadiusOptions'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'RADIUS_OPTIONS' }]))
          })
        })
      }
    }),
    updateVenueRadiusOptions: build.mutation<VenueRadiusOptions, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateVenueRadiusOptions, params, apiCustomHeader)
        return{
          ...req,
          body: enableRbac? JSON.stringify(payload) : payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'RADIUS_OPTIONS' }]
    }),
    getVenueClientAdmissionControl: build.query<VenueClientAdmissionControl, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenueClientAdmissionControl, params, apiCustomHeader)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'ClientAdmissionControl' }]
    }),
    updateVenueClientAdmissionControl: build.mutation<VenueClientAdmissionControl, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateVenueClientAdmissionControl, params, apiCustomHeader)
        return{
          ...req,
          body: enableRbac? JSON.stringify(payload) : payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'ClientAdmissionControl' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivitySuccess(api, msg, 'UpdateVenueClientAdmissionControlSettings', requestArgs.callback)
        })
      }
    }),
    getVenueApManagementVlan: build.query<ApManagementVlan, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueApManagementVlan, params)
        return{
          ...req
        }
      },
      transformResponse: (data: ApManagementVlan ) => {
        return {
          ...data,
          vlanId: data.vlanId ?? 1,
          keepAp: !data.vlanId
        }
      }
    }),
    updateVenueApManagementVlan: build.mutation<ApManagementVlan, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueApManagementVlan, params)
        return{
          ...req,
          body: payload
        }
      }
    }),
    getVenueApEnhancedKey: build.query<ApEnhancedKey, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueApEnhancedKey, params)
        return{
          ...req
        }
      }
    }),
    updateVenueApEnhancedKey: build.mutation<ApEnhancedKey, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenueApEnhancedKey, params)
        return{
          ...req,
          body: payload
        }
      }
    }),
    bulkUpdateUnitProfile: build.mutation<PropertyUnit, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          PropertyUrlsInfo.bulkUpdateUnitProfile,
          params)
        return{
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyUnit', id: 'LIST' }]
    }),
    getVenueAntennaType: build.query< VeuneApAntennaTypeSettings[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueAntennaType, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'ExternalAntenna', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['UpdateVenueAntennaType'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'ExternalAntenna', id: 'LIST' }]))
            })
        })
      }
    }),
    updateVenueAntennaType: build.mutation< CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueAntennaType, params)
        return{
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'ExternalAntenna', id: 'LIST' }]
    })
  })
})

export const {
  useVenuesListQuery,
  useLazyVenuesListQuery,
  useVenuesTableQuery,
  useAddVenueMutation,
  useLazyGetTimezoneQuery,
  useGetVenueQuery,
  useLazyGetVenueQuery,
  useGetVenuesQuery,
  useUpdateVenueMutation,
  useVenueDetailsHeaderQuery,
  useGetVenueCityListQuery,
  useGetVenueSettingsQuery,
  useLazyGetVenueSettingsQuery,
  useUpdateVenueMeshMutation,
  useUpdateVenueCellularSettingsMutation,
  useMeshApsQuery,
  useGetFloorPlanMeshApsQuery,
  useDeleteVenueMutation,
  useGetNetworkApGroupsQuery,
  useGetNetworkApGroupsV2Query,
  useGetFloorPlanQuery,
  useFloorPlanListQuery,
  useDeleteFloorPlanMutation,
  useAddFloorPlanMutation,
  useGetUploadURLMutation,
  useGetVenueSpecificUploadURLMutation,
  useUpdateFloorPlanMutation,
  useGetAllDevicesQuery,
  useUpdateSwitchPositionMutation,
  useUpdateApPositionMutation,
  useUpdateCloudpathServerPositionMutation,
  useGetVenueCapabilitiesQuery,
  useGetApCompatibilitiesVenueQuery,
  useLazyGetApCompatibilitiesVenueQuery,
  useGetVenueApModelsQuery,
  useGetVenueLedOnQuery,
  useLazyGetVenueLedOnQuery,
  useUpdateVenueLedOnMutation,
  useGetVenueApModelBandModeSettingsQuery,
  useLazyGetVenueApModelBandModeSettingsQuery,
  useUpdateVenueApModelBandModeSettingsMutation,
  useGetVenueLanPortsQuery,
  useLazyGetVenueLanPortsQuery,
  useUpdateVenueLanPortsMutation,
  useVenueSwitchAAAServerListQuery,
  useGetAaaSettingQuery,
  useUpdateAAASettingMutation,
  useAddAAAServerMutation,
  useUpdateAAAServerMutation,
  useDeleteAAAServerMutation,
  useBulkDeleteAAAServerMutation,
  useGetDenialOfServiceProtectionQuery,
  useUpdateDenialOfServiceProtectionMutation,
  useGetRogueApLocationQuery,
  useGetVenueRogueApQuery,
  useGetOldVenueRogueApQuery,
  useUpdateVenueRogueApMutation,
  useGetRoguePoliciesQuery,
  useConfigProfilesQuery,
  useVenueSwitchSettingQuery,
  useUpdateVenueSwitchSettingMutation,
  useVenueDHCPProfileQuery,
  useVenueDHCPPoolsQuery,
  useVenuesLeasesListQuery,
  useActivateDHCPPoolMutation,
  useDeactivateDHCPPoolMutation,
  useUpdateVenueDHCPProfileMutation,
  useVenueDefaultRegulatoryChannelsQuery,
  useGetDefaultRadioCustomizationQuery,
  useGetVenueRadioCustomizationQuery,
  useLazyGetVenueRadioCustomizationQuery,
  useUpdateVenueRadioCustomizationMutation,
  useGetVenueTripleBandRadioSettingsQuery,
  useUpdateVenueTripleBandRadioSettingsMutation,
  useGetVenueExternalAntennaQuery,
  useLazyGetVenueExternalAntennaQuery,
  useGetVenueApCapabilitiesQuery,
  useUpdateVenueExternalAntennaMutation,
  useGetAvailableLteBandsQuery,
  useGetVenueApModelCellularQuery,
  useGetVenueDirectedMulticastQuery,
  useLazyGetVenueDirectedMulticastQuery,
  useUpdateVenueDirectedMulticastMutation,
  useGetVenueConfigHistoryQuery,
  useLazyGetVenueConfigHistoryQuery,
  useGetVenueConfigHistoryDetailQuery,
  useLazyGetVenueConfigHistoryDetailQuery,
  useGetVenueLoadBalancingQuery,
  useUpdateVenueLoadBalancingMutation,
  useGetVenueBssColoringQuery,
  useLazyGetVenueBssColoringQuery,
  useUpdateVenueBssColoringMutation,
  useGetTopologyQuery,
  useGetApMeshTopologyQuery,
  useGetVenueMdnsFencingQuery,
  useUpdateVenueMdnsFencingMutation,

  useGetPropertyConfigsQuery,
  useGetQueriablePropertyConfigsQuery,
  useUpdatePropertyConfigsMutation,
  usePatchPropertyConfigsMutation,
  useAddPropertyUnitMutation,
  useGetPropertyUnitByIdQuery,
  useLazyGetPropertyUnitByIdQuery,
  useGetPropertyUnitListQuery,
  useLazyGetPropertyUnitListQuery,
  useUpdatePropertyUnitMutation,
  useDeletePropertyUnitsMutation,
  useNotifyPropertyUnitsMutation,

  useImportPropertyUnitsMutation,
  useLazyDownloadPropertyUnitsQuery,
  useGetVenueRadiusOptionsQuery,
  useUpdateVenueRadiusOptionsMutation,
  useGetVenueClientAdmissionControlQuery,
  useLazyGetVenueClientAdmissionControlQuery,
  useUpdateVenueClientAdmissionControlMutation,
  useGetVenueApManagementVlanQuery,
  useBulkUpdateUnitProfileMutation,
  useLazyGetVenueApManagementVlanQuery,
  useUpdateVenueApManagementVlanMutation,
  useGetVenueApEnhancedKeyQuery,
  useLazyGetVenueApEnhancedKeyQuery,
  useUpdateVenueApEnhancedKeyMutation,
  useGetVenueAntennaTypeQuery,
  useLazyGetVenueAntennaTypeQuery,
  useUpdateVenueAntennaTypeMutation
} = venueApi


export const aggregatedVenueCompatibilitiesData = (venueList: TableResult<Venue>,
  apCompatibilities: { [key:string]: number }) => {
  const data:Venue[] = []
  venueList.data.forEach(item=>{
    item.incompatible = apCompatibilities[item.id]
    data.push(item)
  })
  return {
    ...venueList,
    data
  }
}

type VenueSubset = {
  deepVenue?: NetworkVenue,
  id: string,
  activated?: Network['activated']
  latitude?: string,
  longitude?: string
}

export const useScheduleSlotIndexMap = (tableData: VenueSubset[], isMapEnabled?: boolean) => {
  const [scheduleSlotIndexMap, setScheduleSlotIndexMap] = useState<Record<string,ISlotIndex>>({})
  const [getTimezone] = useLazyGetTimezoneQuery()

  useEffect(()=>{
    const updateVenueCurrentSlotIndexMap = async (id: string, venueLatitude?: string, venueLongitude?: string) => {
      let timeZone
      if (Number(venueLatitude) && Number(venueLongitude)) {
        timeZone = isMapEnabled ?
          await getTimezone({ params: { lat: venueLatitude, lng: venueLongitude } }).unwrap() :
          getVenueTimeZone(Number(venueLatitude), Number(venueLongitude))
      }
      const slotIndex = getCurrentTimeSlotIndex(timeZone)
      setScheduleSlotIndexMap(prevSlotIndexMap => ({ ...prevSlotIndexMap, ...{ [id]: slotIndex } }))
    }

    tableData.forEach(item => {
      if (item.activated?.isActivated && item.deepVenue?.scheduler?.type === SchedulerTypeEnum.CUSTOM) {
        updateVenueCurrentSlotIndexMap(item.id, item.latitude, item.longitude)
      }
    })
  }, [isMapEnabled, tableData])

  return scheduleSlotIndexMap
}
