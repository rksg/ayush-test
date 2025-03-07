/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
import { cloneDeep, omit, uniq }                   from 'lodash'
import { Params }                                  from 'react-router-dom'

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
  VenueApSmartMonitor,
  VenueApRebootTimeout,
  VenueIot,
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
  getCurrentTimeSlotIndex,
  SchedulerTypeEnum,
  ISlotIndex,
  Network,
  WifiRbacUrlsInfo,
  GetApiVersionHeader,
  CommonRbacUrlsInfo,
  ApiVersionEnum,
  Mesh,
  ApGroupConfigTemplateUrlsInfo,
  RogueApSettingsRequest,
  WifiDHCPClientLeases,
  WifiDhcpPoolUsages,
  RWG,
  NetworkDevice,
  NetworkDeviceType,
  NetworkDevicePosition,
  RbacAPMesh,
  EthernetPortProfileUrls,
  EthernetPortProfileViewData,
  CompatibilityResponse,
  IncompatibleFeatureLevelEnum,
  SoftGreUrls,
  SoftGreViewData,
  VenueApUsbStatus,
  ClientIsolationUrls,
  ClientIsolationViewModel,
  LanPortsUrls,
  VenueLanPortSettings,
  UnitLinkedPersona
} from '@acx-ui/rc/utils'
import { baseVenueApi }                                                                          from '@acx-ui/store'
import { ITimeZone, RequestPayload }                                                             from '@acx-ui/types'
import { APT_QUERY_CACHE_TIME, batchApi, createHttpRequest, ignoreErrorModal, getVenueTimeZone } from '@acx-ui/utils'

import { getNewApViewmodelPayloadFromOld, fetchAppendApPositions } from './apUtils'
import {
  fetchEnhanceRbacAllApGroupNetworkVenueList,
  fetchRbacAllApGroupNetworkVenueList
} from './networkVenueUtils'
import {
  getVenueDHCPProfileFn,
  getVenueRoguePolicyFn,
  transformGetVenueDHCPPoolsResponse,
  updateVenueRoguePolicyFn
} from './servicePolicy.utils'
import { handleCallbackWhenActivitySuccess, isPayloadHasField } from './utils'
import {
  convertToApMeshDataList,
  convertToMeshTopologyDataList,
  createVenueDefaultRadioCustomizationFetchArgs, createVenueDefaultRegulatoryChannelsFetchArgs,
  createVenueRadioCustomizationFetchArgs, createVenueUpdateRadioCustomizationFetchArgs,
  mappingLanPortWithClientIsolationPolicy,
  mappingLanPortWithEthernetPortProfile,
  mappingLanPortWithSoftGreProfile
} from './venue.utils'

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
        const venuesData = venueList?.data as Venue[]
        const venueIds = venuesData?.filter(v => {
          if (v.aggregatedApStatus) {
            return Object.values(v.aggregatedApStatus || {}).reduce((a, b) => a + b, 0) > 0
          }
          return false
        }).map(v => v.id) || []

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
      keepUnusedDataFor: APT_QUERY_CACHE_TIME,
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
    enhanceVenueTable: build.query<TableResult<Venue>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const venueListReq = {
          ...createHttpRequest(CommonUrlsInfo.getVenuesList, arg.params),
          body: arg.payload
        }
        const venueListQuery = await fetchWithBQ(venueListReq)
        const venueList = venueListQuery.data as TableResult<Venue>
        const venuesData = venueList?.data as Venue[]
        const venueIds = venuesData?.filter(v => {
          if (v.aggregatedApStatus) {
            return Object.values(v.aggregatedApStatus || {}).reduce((a, b) => a + b, 0) > 0
          }
          return false
        }).map(v => v.id) || []

        const venueIdsToIncompatible:{ [key:string]: number } = {}
        try {
          const apCompatibilitiesReq = {
            ...createHttpRequest(WifiRbacUrlsInfo.getVenueApCompatibilities, undefined, GetApiVersionHeader(ApiVersionEnum.v1)),
            body: JSON.stringify({
              filters: {
                venueIds: venueIds,
                featureLevels: [IncompatibleFeatureLevelEnum.VENUE]
              },
              page: 1,
              pageSize: 100
            })
          }

          const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
          const apCompatibilitiesResponse = (apCompatibilitiesQuery.data) as CompatibilityResponse
          const apCompatibilities = apCompatibilitiesResponse?.compatibilities

          venueIds.forEach((id:string, index:number) => {
            venueIdsToIncompatible[id] = apCompatibilities?.[index]?.incompatible ?? 0
          })

        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('enhanceVenuesTable getApCompatibilitiesVenue error:', e)
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
    addVenue: build.mutation<CommonResult, RequestPayload>({
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
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac ? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenue, params, apiCustomHeader)
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
    updateVenue: build.mutation<CommonResult, RequestPayload>({
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
      providesTags: [{ type: 'Venue', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const USE_CASES = [
            'AddNetworkVenue',
            'DeleteNetworkVenue',
            'ActivateWifiNetworkOnVenue',
            'ActivateWifiNetworkTemplateOnVenue',
            'DeactivateWifiNetworkOnVenue',
            'DeactivateWifiNetworkTemplateOnVenue'
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
        const urlsInfo = enableRbac ? CommonRbacUrlsInfo : CommonUrlsInfo
        const req = createHttpRequest(urlsInfo.getVenueCityList, params, headers)
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
            'UpdateMeshOptions',
            'UpdateVenueApMeshSettings' // new api used activity
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([
              { type: 'Venue', id: 'WIFI_SETTINGS' },
              { type: 'Venue', id: 'VENUE_MESH_SETTINGS' }
            ]))
          })
        })
      }
    }),
    getVenueMesh: build.query<Mesh, RequestPayload>({
      query: ({ params, isWifiMeshIndependents56GEnable }) => {
        const customHeaders = GetApiVersionHeader(isWifiMeshIndependents56GEnable? ApiVersionEnum.v1_1 :ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.getVenueMesh, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'VENUE_MESH_SETTINGS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueApMeshSettings'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'VENUE_MESH_SETTINGS' }]))
          })
        })
      }
    }),
    updateVenueMesh: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac, isWifiMeshIndependents56GEnable }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : CommonUrlsInfo
        const customHeaders = GetApiVersionHeader(
          enableRbac ? (isWifiMeshIndependents56GEnable? ApiVersionEnum.v1_1 :ApiVersionEnum.v1) : undefined)
        const req = createHttpRequest(urlsInfo.updateVenueMesh, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'WIFI_SETTINGS' }, { type: 'Venue', id: 'VENUE_MESH_SETTINGS' }]
    }),
    updateVenueCellularSettings: build.mutation<VenueApModelCellular[], RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac ? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateVenueCellularSettings, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    meshAps: build.query<TableResult<APMesh>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getMeshAps, params)

        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Device', id: 'MESH' }],
      extraOptions: { maxRetries: 5 }
    }),
    rbacMeshAps: build.query<TableResult<APMesh>, RequestPayload>({
      queryFn: async ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) => {
        const rbacApMeshReq = createHttpRequest(WifiRbacUrlsInfo.getMeshAps, params, GetApiVersionHeader(ApiVersionEnum.v1))
        const rbacApMeshListRes = await fetchWithBQ({
          ...rbacApMeshReq,
          body: JSON.stringify(payload)
        })

        const rbacApMeshData = rbacApMeshListRes.data as TableResult<RbacAPMesh>
        const apMeshData = [] as APMesh[]


        rbacApMeshData.data?.forEach((rbacApMesh) => {
          const { root, members=[] } = rbacApMesh
          const newApMesh = convertToApMeshDataList([root], members) as APMesh[]

          apMeshData.push(newApMesh[0])
        })

        const meshAps = { data: apMeshData, totalCount: rbacApMeshData.totalCount } as TableResult<APMesh>
        return {
          data: meshAps
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
    getRbacFloorPlanMeshAps: build.query<TableResult<FloorPlanMeshAP>, RequestPayload>({
      queryFn: async ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) => {
        const newPayload = JSON.stringify(getNewApViewmodelPayloadFromOld(payload as Record<string, unknown>))

        const apListReq = createHttpRequest(WifiRbacUrlsInfo.getMeshAps, params, GetApiVersionHeader(ApiVersionEnum.v1))
        const apListRes = await fetchWithBQ({ ...apListReq, body: newPayload })
        const rbacApListData = apListRes.data as TableResult<RbacAPMesh>
        const apMeshData = [] as FloorPlanMeshAP[]

        rbacApListData.data?.forEach((rbacApMesh) => {
          const { root, members=[] } = rbacApMesh
          const newApMesh = convertToMeshTopologyDataList([root], members) as FloorPlanMeshAP[]

          apMeshData.push(newApMesh[0])
        })

        const apListData = { data: apMeshData, totalCount: rbacApListData.totalCount } as TableResult<FloorPlanMeshAP>
        // fetch ap position data
        if (isPayloadHasField(payload, 'xPercent') || isPayloadHasField(payload, 'yPercent')) {
          await fetchAppendApPositions(apListData as TableResult<FloorPlanMeshAP>, fetchWithBQ)
        }

        return {
          data: apListData
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
      async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {

        const payloadData = payload as { venueId: string, networkId: string, isTemplate: boolean }[]
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
            ...createHttpRequest(payloadData[0].isTemplate
              ? ApGroupConfigTemplateUrlsInfo.getApGroupsList
              : WifiUrlsInfo.getApGroupsList, params),
            body: JSON.stringify(apGroupPayload)
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
          ...createHttpRequest(CommonUrlsInfo.networkActivations, params, apiV2CustomHeader),
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
    getRbacNetworkApGroups: build.query<NetworkVenue[], RequestPayload>({
      async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {

        const payloadData = payload as { venueId: string, networkId: string, isTemplate: boolean }[]
        const filters = payloadData.map(item => ({
          venueId: item.venueId,
          networkId: item.networkId
        }))

        const venueIds = uniq(filters.map(item => item.venueId))
        const isTemplate = payloadData[0].isTemplate
        const venueApgroupMap = await getVenueApgroupMapWithDefaultValue(venueIds, params, isTemplate, fetchWithBQ)

        const paramsVenueId = payloadData[0].venueId
        const paramsNetworkId = payloadData[0].networkId
        const apGroupIds = venueApgroupMap.get(paramsVenueId)?.map(item => item.apGroupId)

        let networkVenuesApGroupList = [] as NetworkVenue[]
        const apGroupNetworkListParams = {
          ...params,
          venueId: paramsVenueId
        }
        const apGroupNetworkListPayload = {
          isTemplate: isTemplate,
          apGroupIds: apGroupIds,
          fields: ['id', 'venueApGroups'],
          pageSize: 10000,
          filters: { 'venueApGroups.apGroupIds': apGroupIds }
        }

        const {
          error: apGroupNetworkListQueryError,
          networkList,
          networkDeepListList
        } = await fetchRbacAllApGroupNetworkVenueList({
          params: apGroupNetworkListParams,
          payload: apGroupNetworkListPayload
        }, fetchWithBQ)

        networkVenuesApGroupList = networkDeepListList.response
          .flatMap(networkInfo => networkInfo.venues)
          .filter(networkVenue => networkVenue.networkId === paramsNetworkId) as NetworkVenue[]

        let aggregatedList: NetworkVenue[] | undefined

        if (filters.length === 1 && !filters[0].networkId ) { // for create Netwrok
          const venueId = filters[0].venueId
          const networkVenueData = networkVenuesApGroupList[0]
          const networkVenue = omit(networkVenueData, ['networkId', 'id'])

          aggregatedList = [{
            ...networkVenue,
            apGroups: cloneDeep(venueApgroupMap.get(venueId))
          }]

        } else {
          aggregatedList = networkVenuesApGroupList.map(networkVenue => {
            const { venueId, apGroups=[] } = networkVenue
            const newApgroups = cloneDeep(apGroups)

            const currentApGroupsDefaultValue = venueApgroupMap.get(venueId!)
            currentApGroupsDefaultValue?.forEach(apGroupDefaultValue => {
              const customApGroup = apGroups.find(item => item.apGroupId === apGroupDefaultValue.apGroupId)
              const customApGroupIndex = apGroups.findIndex(item => item.apGroupId === apGroupDefaultValue.apGroupId)
              if (!customApGroup) {
                newApgroups.push(cloneDeep(apGroupDefaultValue))
              } else {
                newApgroups[customApGroupIndex] = { ...apGroupDefaultValue, ...customApGroup }
              }
            })

            return {
              ...networkVenue,
              apGroups: newApgroups
            }
          })
        }

        return networkList.data
          ? { data: aggregatedList }
          : { error: apGroupNetworkListQueryError as FetchBaseQueryError }
      }
    }),

    getRbacNetworkApGroupsV2: build.query<NetworkVenue[], RequestPayload>({
      async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {

        const payloadData = payload as { venueId: string, networkId: string, isTemplate: boolean }[]
        const filters = payloadData.map(item => ({
          venueId: item.venueId,
          networkId: item.networkId
        }))

        const venueIds = uniq(filters.map(item => item.venueId))
        const isTemplate = payloadData[0].isTemplate
        const venueApgroupMap = await getVenueApgroupMapWithDefaultValue(venueIds, params, isTemplate, fetchWithBQ)

        const paramsVenueId = payloadData[0].venueId
        const paramsNetworkId = payloadData[0].networkId
        const apGroupIds = venueApgroupMap.get(paramsVenueId)?.map(item => item.apGroupId)

        let networkVenuesApGroupList = [] as NetworkVenue[]
        const apGroupNetworkListParams = {
          ...params,
          venueId: paramsVenueId
        }
        const apGroupNetworkListPayload = {
          isTemplate: isTemplate,
          apGroupIds: apGroupIds,
          fields: ['id', 'venueApGroups'],
          pageSize: 10000,
          filters: { 'venueApGroups.apGroupIds': apGroupIds }
        }

        const {
          error: apGroupNetworkListQueryError,
          networkList,
          networkDeepListList
        } = await fetchEnhanceRbacAllApGroupNetworkVenueList({
          params: apGroupNetworkListParams,
          payload: apGroupNetworkListPayload
        }, fetchWithBQ)

        networkVenuesApGroupList = networkDeepListList.response
          .flatMap(networkInfo => networkInfo.venues)
          .filter(networkVenue => networkVenue.networkId === paramsNetworkId) as NetworkVenue[]

        let aggregatedList: NetworkVenue[] | undefined

        if (filters.length === 1 && !filters[0].networkId ) { // for create Netwrok
          const venueId = filters[0].venueId
          const networkVenueData = networkVenuesApGroupList[0]
          const networkVenue = omit(networkVenueData, ['networkId', 'id'])

          aggregatedList = [{
            ...networkVenue,
            apGroups: cloneDeep(venueApgroupMap.get(venueId))
          }]

        } else {
          aggregatedList = networkVenuesApGroupList.map(networkVenue => {
            const { venueId, apGroups=[] } = networkVenue
            const newApgroups = cloneDeep(apGroups)

            const currentApGroupsDefaultValue = venueApgroupMap.get(venueId!)
            currentApGroupsDefaultValue?.forEach(apGroupDefaultValue => {
              const customApGroup = apGroups.find(item => item.apGroupId === apGroupDefaultValue.apGroupId)
              const customApGroupIndex = apGroups.findIndex(item => item.apGroupId === apGroupDefaultValue.apGroupId)
              if (!customApGroup) {
                newApgroups.push(cloneDeep(apGroupDefaultValue))
              } else {
                newApgroups[customApGroupIndex] = { ...apGroupDefaultValue, ...customApGroup }
              }
            })

            return {
              ...networkVenue,
              apGroups: newApgroups
            }
          })
        }

        return networkList.data
          ? { data: aggregatedList }
          : { error: apGroupNetworkListQueryError as FetchBaseQueryError }
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
      async queryFn ({ params, payload }, _api, _extraOptions, query) {

        const devicesReq = { ...createHttpRequest(CommonUrlsInfo.getAllDevices, params),
          body: payload as NetworkDevicePayload
        }
        const responses = params?.showRwgDevice === 'true'
          ? await Promise.all([
            devicesReq,
            createHttpRequest(CommonRbacUrlsInfo.getRwgListByVenueId, params)
          ].map(query))
          : await Promise.all([
            devicesReq
          ].map(query))

        const allDevices = responses[0].data as NetworkDeviceResponse

        const { response: rwgDevices } = ((responses[1] && responses[1].data) || {}) as {
          requestId: string,
          response : {
            data: RWG[],
            totalCount: number,
            page: number
          }
        }

        let rwgList: NetworkDevice[] = []
        if (rwgDevices?.data?.length) {
          const rwgs = rwgDevices.data

          rwgList = rwgs.map(_rwg => {
            return {
              id: _rwg.rwgId,
              name: _rwg.name,
              deviceStatus: _rwg.status,
              networkDeviceType: NetworkDeviceType.rwg,
              serialNumber: '',
              floorplanId: _rwg.floorplanId,
              xPercent: _rwg.xPercent,
              yPercent: _rwg.yPercent,
              x: _rwg.x,
              y: _rwg.y
            } as NetworkDevice
          }) as NetworkDevice[]
        }

        return { data: { data: [{ ...allDevices.data[0], rwg: rwgList }],
          totalCount: allDevices.totalCount + rwgList.length,
          fields: [],
          page: 1 } as NetworkDeviceResponse }
      },
      providesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' },
        { type: 'RWG', id: 'List' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateSwitchPosition',
            'UpdateApPosition',
            'UpdateRwgPosition',
            'DeleteFloorPlan',
            'ActivateApFloorPosition',
            'DeactivateApFloorPosition'
          ], () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'VenueFloorPlan', id: 'DEVICE' },
              { type: 'RWG', id: 'List' }]))
          })
        })
      }
    }),
    updateSwitchPosition: build.mutation<CommonResult, RequestPayload<NetworkDevicePosition>>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? CommonRbacUrlsInfo : CommonUrlsInfo
        const req = createHttpRequest(urlsInfo.UpdateSwitchPosition, params)
        const body = JSON.parse(JSON.stringify(payload))
        if(enableRbac) {
          body.floorPlanId = payload?.floorplanId
          delete body.floorplanId
        }
        return {
          ...req,
          body
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' }]
    }),
    updateApPosition: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? CommonRbacUrlsInfo : CommonUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.UpdateApPosition, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' }]
    }),
    removeApPosition: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(CommonRbacUrlsInfo.RemoveApPosition, params, apiCustomHeader)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' }]
    }),
    updateRwgPosition: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonRbacUrlsInfo.UpdateRwgPosition, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RWG', id: 'List' }]
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
    getVenueApCompatibilities: build.query<CompatibilityResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...ignoreErrorModal
        }
        const req = createHttpRequest(WifiRbacUrlsInfo.getVenueApCompatibilities, params, apiCustomHeader)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getVenuePreCheckApCompatibilities: build.query<CompatibilityResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...ignoreErrorModal
        }
        const req = createHttpRequest(WifiRbacUrlsInfo.getVenuePreCheckApCompatibilities, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getVenueApModels: build.query<VenueApModels, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenueApModels, params, apiCustomHeader)
        return{
          ...req
        }
      }
    }),
    getVenueLedOn: build.query<VenueLed[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenueLedOn, params, apiCustomHeader)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'VENUE_LED_SETTINGS' }]
    }),
    updateVenueLedOn: build.mutation<VenueLed[], RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateVenueLedOn, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'VENUE_LED_SETTINGS' }]
    }),
    getVenueApUsbStatus: build.query<VenueApUsbStatus[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          WifiRbacUrlsInfo.getVenueApUsbStatus,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1))

        return {
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'VENUE_USB_SETTINGS' }]
    }),
    updateVenueApUsbStatus: build.mutation<CommonResult, RequestPayload<VenueApUsbStatus[]>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          WifiRbacUrlsInfo.updateVenueApUsbStatus,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1))

        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'VENUE_USB_SETTINGS' }]
    }),
    // eslint-disable-next-line max-len
    getVenueApModelBandModeSettings: build.query<VenueApModelBandModeSettings[], RequestPayload<void>>({
      query: ({ params }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        return createHttpRequest(WifiRbacUrlsInfo.getVenueApModelBandModeSettings, params, apiCustomHeader)
      },
      providesTags: [{ type: 'Venue', id: 'BandModeSettings' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueApModelBandModeSettings: build.mutation<CommonResult, RequestPayload<VenueApModelBandModeSettings[]>>({
      query: ({ params, payload }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.updateVenueApModelBandModeSettings, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'BandModeSettings' }]
    }),
    getDefaultVenueLanPorts: build.query<VenueLanPorts[], RequestPayload>({
      query: ({ params }) => {
        const rbacApiVersion = ApiVersionEnum.v1
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
        const req = createHttpRequest(WifiRbacUrlsInfo.getDefaultVenueLanPorts, params, apiCustomHeader)
        return{
          ...req
        }
      }
    }),
    getVenueLanPorts: build.query<VenueLanPorts[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac ? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
        const req = createHttpRequest(urlsInfo.getVenueLanPorts, params, apiCustomHeader)
        return{
          ...req
        }
      }
    }),
    updateVenueLanPorts: build.mutation<VenueLanPorts[], RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac ? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
        const req = createHttpRequest(urlsInfo.updateVenueLanPorts, params, apiCustomHeader)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getAvailableLteBands: build.query<AvailableLteBands[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac ? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getAvailableLteBands, params, apiCustomHeader)
        return{
          ...req
        }
      }
    }),
    getVenueApModelCellular: build.query<VenueApModelCellular, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac ? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenueApModelCellular, params, apiCustomHeader)
        return{
          ...req
        }
      }
    }),
    configProfiles: build.query<ConfigurationProfile[], RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const req = createHttpRequest(SwitchUrlsInfo.getProfiles, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
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
      },
      providesTags: [{ type: 'Venue', id: 'SWITCH_SETTING' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['UpdateVenueSwitchSetting'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'SWITCH_SETTING' }]))
            })
        })
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
            [
              'AddAaaServer',
              'UpdateAaaServer',
              'DeleteAaaServer',
              'UpdateVenueAaaSetting',
              'UpdateVenueTemplateAaaSetting',
              'UpdateVenueAaaServer',
              'UpdateVenueTemplateAaaServer'
            ], () => {
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
        const headers = enableRbac ? customHeaders.v1001 : {}
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
      query: createVenueDefaultRegulatoryChannelsFetchArgs()
    }),
    getDefaultRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: createVenueDefaultRadioCustomizationFetchArgs()
    }),
    getVenueRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: createVenueRadioCustomizationFetchArgs(),
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
    updateVenueRadioCustomization: build.mutation<CommonResult, RequestPayload>({
      query: createVenueUpdateRadioCustomizationFetchArgs(),
      invalidatesTags: [{ type: 'VenueRadio', id: 'LIST' }]
    }),
    getVenueTripleBandRadioSettings: build.query<TriBandSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueTripleBandRadioSettings, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'TripleBandRadioSettings' }]
    }),
    updateVenueTripleBandRadioSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueTripleBandRadioSettings, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'TripleBandRadioSettings' }]
    }),
    getVenueApCapabilities: build.query<Capabilities, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getVenueApCapabilities, params, apiCustomHeader)
        return {
          ...req
        }
      }
    }),
    updateVenueExternalAntenna: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateVenueExternalAntenna, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'ExternalAntenna', id: 'LIST' }]
    }),
    getDenialOfServiceProtection: build.query<VenueDosProtection, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : CommonUrlsInfo
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
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateDenialOfServiceProtection, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    getVenueRogueAp: build.query<VenueRogueAp, RequestPayload>({
      queryFn: getVenueRoguePolicyFn(),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueRogueAp',
            'UpdateDenialOfServiceProtection',
            'ActivateRoguePolicyOnVenue',
            'DeactivateRoguePolicyOnVenue'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }, { type: 'Venue', id: 'RogueAp' }]))
          })
        })
      },
      providesTags: [{ type: 'Venue', id: 'RogueAp' }]
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
    updateVenueRogueAp: build.mutation<VenueRogueAp, RequestPayload<RogueApSettingsRequest>>({
      queryFn: updateVenueRoguePolicyFn(),
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
      queryFn: getVenueDHCPProfileFn(),
      providesTags: [{ type: 'Venue', id: 'DHCPProfile' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueDhcpConfigServiceProfileSetting',
            'DeactivateDhcpConfigServiceProfile',
            'ActivateDhcpConfigServiceProfileAndUpdateSettings'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'DHCPProfile' }]))
          })
        })
      }

    }),
    venueDHCPPools: build.query<VenueDHCPPoolInst[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const url = enableRbac ? DHCPUrls.getDhcpUsagesRbac : DHCPUrls.getVenueActivePools
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url, params, headers)
        return {
          ...req
        }
      },
      transformResponse: transformGetVenueDHCPPoolsResponse,
      providesTags: [{ type: 'Venue', id: 'poolList' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'DeactivateVenueDhcpPool',
            'ActivateVenueDhcpPool'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'poolList' }]))
          })
        })
      }
    }),
    venuesUsageList: build.query<WifiDhcpPoolUsages, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DHCPUrls.getDhcpUsagesRbac, params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req
        }
      }
    }),
    venuesLeasesList: build.query<DHCPLeases[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const url = enableRbac ? DHCPUrls.getVenueLeasesRbac : DHCPUrls.getVenueLeases
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const leasesList = createHttpRequest(url, params, headers)
        return {
          ...leasesList
        }
      },
      transformResponse: (response: DHCPLeases[] | WifiDHCPClientLeases, _meta: FetchBaseQueryMeta, arg: RequestPayload) => {
        if (arg.enableRbac) {
          return ((response as WifiDHCPClientLeases).wifiDhcpClientLeases)
        }
        return response as DHCPLeases[]
      }
    }),
    activateDHCPPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const url = enableRbac ? DHCPUrls.bindVenueDhcpProfile : DHCPUrls.activeVenueDHCPPool
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url, params, headers)
        return {
          ...req,
          ...(enableRbac ? { body: JSON.stringify(payload) } : {})
        }
      }
    }),
    deactivateDHCPPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const url = enableRbac ? DHCPUrls.bindVenueDhcpProfile : DHCPUrls.deactivateVenueDHCPPool
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url, params, headers)
        return {
          ...req,
          ...(enableRbac ? { body: JSON.stringify(payload) } : {})
        }
      }
    }),
    updateVenueDHCPProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac, enableService }) => {
        const url = !enableRbac ? DHCPUrls.updateVenueDHCPProfile : (enableService ? DHCPUrls.bindVenueDhcpProfile : DHCPUrls.unbindVenueDhcpProfile)
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url, params, headers)
        return {
          ...req,
          ...(enableRbac && !enableService ? {} : { body: JSON.stringify(payload) })
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
            'UpdateVenueDirectedMulticast',
            'UpdateVenueApDirectedMulticastSettings'
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
          body: JSON.stringify(payload)
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
        return {
          data: result ? result.map(item => ({
            ...item,
            startTime: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(item.startTime),
            configType: (item.configType as unknown as string[])
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
            'UpdateVenueLoadBalancing',
            'UpdateVenueApLoadBalancingSettings' // new api used activity
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
          const targetUseCase = requestArgs.enableRbac ? 'UpdateVenueApLoadBalancingSettings' : 'UpdateVenueLoadBalancing'
          await handleCallbackWhenActivitySuccess(api, msg, targetUseCase, requestArgs.callback)
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
          body: JSON.stringify(payload)
        }
      }
    }),
    getVenueApSmartMonitor: build.query<VenueApSmartMonitor, RequestPayload>({
      query: ({ params }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)

        const req = createHttpRequest(WifiRbacUrlsInfo.getVenueSmartMonitor, params, apiCustomHeader)
        return{
          ...req
        }
      }
    }),
    updateVenueApSmartMonitor: build.mutation<VenueApSmartMonitor, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)

        const req = createHttpRequest(WifiRbacUrlsInfo.updateVenueSmartMonitor, params, apiCustomHeader)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getVenueApRebootTimeout: build.query<VenueApRebootTimeout, RequestPayload>({
      query: ({ params }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)

        const req = createHttpRequest(WifiRbacUrlsInfo.getVenueRebootTimeout, params, apiCustomHeader)
        return{
          ...req
        }
      }
    }),
    updateVenueApRebootTimeout: build.mutation<VenueApRebootTimeout, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)

        const req = createHttpRequest(WifiRbacUrlsInfo.updateVenueRebootTimeout, params, apiCustomHeader)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getVenueIot: build.query<VenueIot, RequestPayload>({
      query: ({ params }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)

        const req = createHttpRequest(WifiRbacUrlsInfo.getVenueIot, params, apiCustomHeader)
        return{
          ...req
        }
      }
    }),
    updateVenueIot: build.mutation<VenueIot, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)

        const req = createHttpRequest(WifiRbacUrlsInfo.updateVenueIot, params, apiCustomHeader)
        return{
          ...req,
          body: JSON.stringify(payload)
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
        return result?.data?.[0] as ApMeshTopologyData
      }
    }),
    getVenueMdnsFencing: build.query<VenueMdnsFencingPolicy, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : CommonUrlsInfo
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
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateVenueMdnsFencingPolicy, params, apiCustomHeader)
        return{
          ...req,
          body: JSON.stringify(payload)
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
    batchGetPropertyUnitsByIds: build.query<PropertyUnit[], RequestPayload<{ venueId: string, ids: string[] }>>({
      async queryFn ({ payload }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!payload?.venueId || !payload?.ids) {
          return { data: [] }
        }

        const venueId = payload.venueId
        const requests = payload.ids.map(unitId => {
          return fetchWithBQ({ ...createHttpRequest(PropertyUrlsInfo.getUnitById, { venueId, unitId }, customHeaders.v1) })
        })
        const result = await Promise.all(requests)
        const error = result.find(r => r.error)

        if (error) {
          return { error: error as FetchBaseQueryError }
        }

        return { data: result.map(r => r.data as PropertyUnit) }
      },
      providesTags: [{ type: 'PropertyUnit', id: 'LIST' }]
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
          responseHandler: async (response: Response) => {
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
    deletePropertyUnits: build.mutation<CommonResult, RequestPayload<string[]>>({
      queryFn: async ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) => {
        const requests = payload?.map(unitId => ({ params: { ...params, unitId } })) ?? []
        const result = await batchApi(PropertyUrlsInfo.deletePropertyUnit, requests, fetchWithBQ)

        if (result.error) {
          return { error: result.error as FetchBaseQueryError }
        }

        return { data: {} as CommonResult }
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
    getUnitsLinkedIdentities: build.query<TableResult<UnitLinkedPersona>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.getUnitsLinkedIdentities, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: NewTableResult<UnitLinkedPersona>) {
        return transferToTableResult<UnitLinkedPersona>(result)
      },
      providesTags: [{ type: 'PropertyUnit', id: 'LIST' }]
    }),
    removeUnitLinkedIdentity: build.mutation({
      query: ({ params }) => {
        const req = createHttpRequest(PropertyUrlsInfo.removeUnitLinkedIdenity, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'PropertyUnit' }]
    }),
    addUnitLinkedIdentity: build.mutation<UnitLinkedPersona, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.addUnitLinkedIdentity, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyUnit', id: 'LIST' }]
    }),
    getVenueRadiusOptions: build.query<VenueRadiusOptions, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : CommonUrlsInfo
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
            'UpdateVenueRadiusOptions',
            'UpdateVenueApRadiusOptions'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'RADIUS_OPTIONS' }]))
          })
        })
      }
    }),
    updateVenueRadiusOptions: build.mutation<VenueRadiusOptions, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateVenueRadiusOptions, params, apiCustomHeader)
        return{
          ...req,
          body: JSON.stringify(payload)
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
          body: JSON.stringify(payload)
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
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.getVenueApManagementVlan, params, apiCustomHeader)
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
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.updateVenueApManagementVlan, params, apiCustomHeader)
        return{
          ...req,
          body: JSON.stringify(payload)
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
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
        const req = createHttpRequest(urlsInfo.getVenueAntennaType, params, apiCustomHeader)
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
    updateVenueAntennaType: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
        const req = createHttpRequest(urlsInfo.updateVenueAntennaType, params, apiCustomHeader)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'ExternalAntenna', id: 'LIST' }]
    }),

    getVenueLanPortWithEthernetSettings: build.query<VenueLanPorts[], RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {

        const urlsInfo = arg.enableRbac ? WifiRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = arg.enableRbac ? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
        const venueLanPortsQuery = await fetchWithBQ(createHttpRequest(urlsInfo.getVenueLanPorts, arg.params, apiCustomHeader))
        const venueLanPortSettings = venueLanPortsQuery.data as VenueLanPorts[]
        const venueId = arg.params?.venueId

        const isEthernetPortProfileEnabled = (arg.payload as any)?.isEthernetPortProfileEnabled
        const isEthernetSoftgreEnabled = (arg.payload as any)?.isEthernetSoftgreEnabled
        const isEthernetClientIsolationEnabled = (arg.payload as any)?.isEthernetClientIsolationEnabled

        if(venueId) {

          // Mapping Ethernet port profile relation to Lan port settings
          const ethernetPortProfileReq = createHttpRequest(EthernetPortProfileUrls.getEthernetPortProfileViewDataList)
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
        }
        return { data: venueLanPortSettings }
      }
    }),

    getVenueLanPortSettings: build.query<VenueLanPortSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          LanPortsUrls.getVenueLanPortSettings, params)
        return {
          ...req
        }
      }
    }),

    getVenueLanPortSettingsByModel: build.query<VenueLanPortSettings[], RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {

        const venueId = arg.params?.venueId
        const model = arg.params?.apModel
        const lanPortCount = arg.params?.lanPortCount || 0

        const venueLanPortSettingsQuery = Array.from({ length: Number(lanPortCount) }, (_, index) =>{
          return fetchWithBQ(
            createHttpRequest(
              LanPortsUrls.getVenueLanPortSettings,
              { venueId, apModel: model, portId: (index + 1).toString() }
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

    updateVenueLanPortSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          LanPortsUrls.updateVenueLanPortSettings, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),

    updateVenueLanPortSpecificSettings:
      build.mutation<CommonResult, RequestPayload>({
        query: ({ params, payload }) => {
          const req = createHttpRequest(
            CommonRbacUrlsInfo.updateVenueLanPortSpecificSettings, params)
          return {
            ...req,
            body: JSON.stringify(payload)
          }
        }
      })
  })
})

export const {
  useVenuesListQuery,
  useLazyVenuesListQuery,
  useVenuesTableQuery,
  useEnhanceVenueTableQuery,
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
  useGetVenueMeshQuery,
  useUpdateVenueMeshMutation,
  useUpdateVenueCellularSettingsMutation,
  useMeshApsQuery,
  useRbacMeshApsQuery,
  useGetFloorPlanMeshApsQuery,
  useGetRbacFloorPlanMeshApsQuery,
  useDeleteVenueMutation,
  useGetNetworkApGroupsQuery,
  useGetNetworkApGroupsV2Query,
  useGetRbacNetworkApGroupsQuery,
  useGetRbacNetworkApGroupsV2Query,
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
  useUpdateRwgPositionMutation,
  useGetApCompatibilitiesVenueQuery,
  useLazyGetApCompatibilitiesVenueQuery,
  useGetVenueApCompatibilitiesQuery,
  useLazyGetVenueApCompatibilitiesQuery,
  useGetVenuePreCheckApCompatibilitiesQuery,
  useLazyGetVenuePreCheckApCompatibilitiesQuery,
  useGetVenueApModelsQuery,
  useGetVenueLedOnQuery,
  useLazyGetVenueLedOnQuery,
  useUpdateVenueLedOnMutation,
  useGetVenueApUsbStatusQuery,
  useLazyGetVenueApUsbStatusQuery,
  useUpdateVenueApUsbStatusMutation,
  useGetVenueApModelBandModeSettingsQuery,
  useLazyGetVenueApModelBandModeSettingsQuery,
  useUpdateVenueApModelBandModeSettingsMutation,
  useGetDefaultVenueLanPortsQuery,
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
  useLazyVenuesUsageListQuery,
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
  useLazyBatchGetPropertyUnitsByIdsQuery,
  useGetPropertyUnitListQuery,
  useLazyGetPropertyUnitListQuery,
  useUpdatePropertyUnitMutation,
  useDeletePropertyUnitsMutation,
  useNotifyPropertyUnitsMutation,
  useGetUnitsLinkedIdentitiesQuery,
  useAddUnitLinkedIdentityMutation,
  useRemoveUnitLinkedIdentityMutation,

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
  useUpdateVenueAntennaTypeMutation,
  useRemoveApPositionMutation,
  useGetVenueApSmartMonitorQuery,
  useLazyGetVenueApSmartMonitorQuery,
  useUpdateVenueApSmartMonitorMutation,
  useGetVenueApRebootTimeoutQuery,
  useLazyGetVenueApRebootTimeoutQuery,
  useUpdateVenueApRebootTimeoutMutation,
  useGetVenueIotQuery,
  useLazyGetVenueIotQuery,
  useUpdateVenueIotMutation,
  useGetVenueLanPortWithEthernetSettingsQuery,
  useLazyGetVenueLanPortWithEthernetSettingsQuery,
  useGetVenueLanPortSettingsQuery,
  useLazyGetVenueLanPortSettingsQuery,
  useLazyGetVenueLanPortSettingsByModelQuery,
  useUpdateVenueLanPortSettingsMutation,
  useUpdateVenueLanPortSpecificSettingsMutation
} = venueApi


export const aggregatedVenueCompatibilitiesData = (venueList: TableResult<Venue>,
  apCompatibilities: { [key:string]: number }) => {
  const data:Venue[] = []
  venueList?.data.forEach(item=>{
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

export const getVenueApgroupMapWithDefaultValue = async (venueIds: string[], params: Params<string> | undefined, isTemplate: boolean = false, fetchWithBQ: any) => {
  let venueApgroupMap = new Map<string, NetworkApGroup[]>()
  const apGroupUrlInfo = isTemplate
    ? ApGroupConfigTemplateUrlsInfo.getApGroupsListRbac
    : WifiRbacUrlsInfo.getApGroupsList

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
      ...createHttpRequest(apGroupUrlInfo, params),
      body: JSON.stringify(apGroupPayload)
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

  return venueApgroupMap
}
