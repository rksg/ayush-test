/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { QueryReturnValue }                        from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
import { find }                                    from 'lodash'

import {
  ApCompatibility,
  ApCompatibilityResponse,
  ApiVersionEnum,
  CommonRbacUrlsInfo,
  CommonResult,
  CommonUrlsInfo,
  ConfigTemplateUrlsInfo,
  Dashboard,
  ExternalProviders,
  GetApiVersionHeader,
  Network,
  NetworkDetail,
  NetworkDetailHeader,
  NetworkRadiusSettings,
  NetworkSaveData,
  NetworkVenue,
  TableResult,
  Venue,
  VenueConfigTemplateUrlsInfo,
  WifiNetwork,
  WifiRbacUrlsInfo,
  WifiUrlsInfo,
  onActivityMessageReceived,
  onSocketActivityChanged,
  transformNetwork,
  RadioTypeEnum,
  BaseNetwork,
  VlanPoolRbacUrls,
  VLANPoolViewModelRbacType,
  transformWifiNetwork
} from '@acx-ui/rc/utils'
import { baseNetworkApi }                      from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

import {
  aggregatedRbacNetworksVenueData,
  aggregatedRbacVenueNetworksData,
  fetchRbacApGroupNetworkVenueList,
  fetchRbacNetworkVenueList,
  fetchRbacVenueNetworkList,
  getNetworkDeepList
} from './networkVenueUtils'
import { updateNetworkVenueFn } from './servicePolicy.utils/network'


const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

const NetworkUseCases = [
  // non-RBAC API
  'AddNetwork',
  'UpdateNetwork',
  'DeleteNetwork',
  // RBAC API
  'AddWifiNetwork',
  'UpdateWifiNetwork',
  'DeleteWifiNetwork'
]

export const networkApi = baseNetworkApi.injectEndpoints({
  endpoints: (build) => ({
    networkList: build.query<TableResult<Network>, RequestPayload>({
      query: ({ params, payload }) => {
        const networkListReq = createHttpRequest(CommonUrlsInfo.getVMNetworksList, params)
        return {
          ...networkListReq,
          body: payload
        }
      },
      transformResponse (result: TableResult<Network>) {
        result.data = result.data.map(item => ({
          ...transformNetwork(item)
        })) as Network[]
        return result
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    networkTable: build.query<TableResult<Network>, RequestPayload>({
      async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {
        const networkListReq = createHttpRequest(CommonUrlsInfo.getVMNetworksList, params)
        const networkListQuery = await fetchWithBQ({ ...networkListReq, body: payload })
        const networkList = networkListQuery.data as TableResult<Network>
        const networkIds = networkList?.data?.filter(n => n.aps > 0).map(n => n.id) || []
        const networkIdsToIncompatible:{ [key:string]: number } = {}
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allApCompatibilitiesQuery:any = await Promise.all(networkIds.map(id => {
            const apCompatibilitiesReq = {
              ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesNetwork, { networkId: id }),
              body: { filters: {} }
            }
            return fetchWithBQ(apCompatibilitiesReq)
          }))
          networkIds.forEach((id:string, index:number) => {
            const allApCompatibilitiesResponse = allApCompatibilitiesQuery[index]?.data as ApCompatibilityResponse
            const allApCompatibilitiesData = allApCompatibilitiesResponse?.apCompatibilities as ApCompatibility[]
            networkIdsToIncompatible[id] = allApCompatibilitiesData[0]?.incompatible ?? 0
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('networkTable getApCompatibilitiesNetwork error:', e)
        }
        const aggregatedList = aggregatedNetworkCompatibilitiesData(
          networkList, networkIdsToIncompatible)

        return networkListQuery.data
          ? { data: aggregatedList }
          : { error: networkListQuery.error as FetchBaseQueryError }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    // RBAC API
    wifiNetworkList: build.query<TableResult<WifiNetwork>, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const networkListReq = createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, params, apiCustomHeader)
        return {
          ...networkListReq,
          body: JSON.stringify(payload)
        }
      },
      transformResponse (result: TableResult<WifiNetwork>) {
        result.data = result.data.map(item => ({
          ...transformWifiNetwork(item)
        })) as WifiNetwork[]
        return result
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    wifiNetworkTable: build.query<TableResult<WifiNetwork>, RequestPayload>({
      async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const networkListReq = createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, params, apiCustomHeader)
        const networkListQuery = await fetchWithBQ({ ...networkListReq, body: JSON.stringify(payload) })
        const networkList = networkListQuery.data as TableResult<WifiNetwork>
        const networkIds = networkList?.data?.filter(n => (n.apSerialNumbers && n.apSerialNumbers.length > 0)).map(n => n.id) || []
        const networkIdsToIncompatible:{ [key:string]: number } = {}
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allApCompatibilitiesQuery:any = await Promise.all(networkIds.map(id => {
            const apCompatibilitiesReq = {
              ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesNetwork, { networkId: id }, apiCustomHeader),
              body: JSON.stringify({ filters: {} })
            }
            return fetchWithBQ(apCompatibilitiesReq)
          }))
          networkIds.forEach((id:string, index:number) => {
            const allApCompatibilitiesResponse = allApCompatibilitiesQuery[index]?.data as ApCompatibilityResponse
            const allApCompatibilitiesData = allApCompatibilitiesResponse?.apCompatibilities as ApCompatibility[]
            networkIdsToIncompatible[id] = allApCompatibilitiesData[0]?.incompatible ?? 0
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('networkTable getApCompatibilitiesNetwork error:', e)
        }
        const aggregatedList = aggregatedWifiNetworkCompatibilitiesData(
          networkList, networkIdsToIncompatible) as TableResult<WifiNetwork>

        return networkListQuery.data
          ? { data: aggregatedList }
          : { error: networkListQuery.error as FetchBaseQueryError }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    addNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = enableRbac? {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...RKS_NEW_UI
        } : RKS_NEW_UI

        const createNetworkReq = createHttpRequest(urlsInfo.addNetworkDeep, params, apiCustomHeader)
        return {
          ...createNetworkReq,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded
            if (response && msg.useCase === 'AddNetwork' && msg.status === 'SUCCESS') {
              (requestArgs.callback as Function)(response.data)
            }
          } catch {
          }
        })
      }
    }),
    updateNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = enableRbac? {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...RKS_NEW_UI
        } : RKS_NEW_UI

        const req = createHttpRequest(urlsInfo.updateNetworkDeep, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    deleteNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.deleteNetwork, params, apiCustomHeader)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }]
    }),
    addNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addNetworkVenue, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    addNetworkVenues: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addNetworkVenues, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    updateNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      queryFn: updateNetworkVenueFn(false),
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    updateNetworkVenues: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateNetworkVenues, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    deleteNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteNetworkVenue, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    deleteNetworkVenues: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteNetworkVenues, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    getNetwork: build.query<NetworkSaveData | null, RequestPayload>({
      async queryFn ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.networkId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)

        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = enableRbac? {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...RKS_NEW_UI
        } : RKS_NEW_UI

        const networkQuery = await fetchWithBQ(
          createHttpRequest(urlsInfo.getNetwork, params, apiCustomHeader)
        )
        return networkQuery as QueryReturnValue<NetworkSaveData,
        FetchBaseQueryError,
        FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    networkDetailHeader: build.query<NetworkDetailHeader, RequestPayload>({
      query: ({ params }) => {
        const networkDetailReq = createHttpRequest(CommonUrlsInfo.getNetworksDetailHeader, params)
        return {
          ...networkDetailReq
        }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const USE_CASES = [
            'AddNetworkVenue',
            'AddNetworkVenueMappings',
            'DeleteNetworkVenue',
            'DeleteNetworkVenues',
            'UpdateNetworkDeep',
            'UpdateNetworkVenue'
          ]
          const CONFIG_TEMPLATE_USE_CASES = [
            'DeleteNetworkVenueTemplate',
            'DeleteNetworkVenueTemplates',
            'AddNetworkVenueTemplate',
            'AddNetworkVenueTemplateMappings',
            'UpdateNetworkVenueTemplate'
          ]
          const useCases = (requestArgs.payload as { isTemplate?: boolean })?.isTemplate ? CONFIG_TEMPLATE_USE_CASES : USE_CASES
          onActivityMessageReceived(msg, useCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }),
    getVenueNetworkApGroup: build.query<TableResult<NetworkVenue>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.venueNetworkApGroup, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    apNetworkList: build.query<TableResult<Network>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getApNetworkList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Network', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    networkVenueList: build.query<TableResult<Venue>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          networkVenuesListQuery,
          networkVenuesList,
          networkVenuesApGroupList,
          networkDeep
        } = await fetchNetworkVenueList(arg, fetchWithBQ)

        const aggregatedList = aggregatedNetworksVenueData(
          networkVenuesList, networkVenuesApGroupList, networkDeep)

        return networkVenuesListQuery.data
          ? { data: aggregatedList }
          : { error: networkVenuesListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateNetworkDeep'], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    networkVenueTable: build.query<TableResult<Venue>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          networkVenuesListQuery,
          networkVenuesList,
          networkVenuesApGroupList,
          networkDeep,
          venueIds
        } = await fetchNetworkVenueList(arg, fetchWithBQ)

        const venueIdsToIncompatible:{ [key:string]: number } = {}
        try {
          const apCompatibilitiesReq = {
            ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesNetwork, arg.params),
            body: { filters: { venueIds } }
          }
          const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
          const apCompatibilitiesResponse = apCompatibilitiesQuery.data as ApCompatibilityResponse
          const apCompatibilities = apCompatibilitiesResponse.apCompatibilities as ApCompatibility[]
          apCompatibilities.forEach((item:ApCompatibility) => {
            venueIdsToIncompatible[item.id] = item.incompatible
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('networkVenueTable getApCompatibilitiesNetwork error:', e)
        }
        const aggregatedList = aggregatedNetworksVenueData(
          networkVenuesList, networkVenuesApGroupList, networkDeep, venueIdsToIncompatible)

        return networkVenuesListQuery.data
          ? { data: aggregatedList }
          : { error: networkVenuesListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateNetworkDeep'], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    venueNetworkList: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { venueNetworkListQuery,
          networkList,
          venueNetworkApGroupList,
          networkDeepListList } = await fetchVenueNetworkList(arg, fetchWithBQ)

        const aggregatedList = aggregatedVenueNetworksData(
          networkList, venueNetworkApGroupList, networkDeepListList)

        return venueNetworkListQuery.data
          ? { data: aggregatedList }
          : { error: venueNetworkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      extraOptions: { maxRetries: 5 }
    }),
    venueNetworkTable: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { venueNetworkListQuery,
          networkList,
          venueNetworkApGroupList,
          networkDeepListList,
          networkIds } = await fetchVenueNetworkList(arg, fetchWithBQ)

        const networkIdsToIncompatible:{ [key:string]: number } = {}
        try {
          const apCompatibilitiesReq = {
            ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesVenue, arg.params),
            body: { filters: { networkIds } }
          }
          const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
          const apCompatibilitiesResponse = apCompatibilitiesQuery.data as ApCompatibilityResponse
          const apCompatibilities = apCompatibilitiesResponse.apCompatibilities as ApCompatibility[]
          apCompatibilities.forEach((item:ApCompatibility) => {
            networkIdsToIncompatible[item.id] = item.incompatible
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('venueNetworkTable getApCompatibilitiesVenue error:', e)
        }

        const aggregatedList = aggregatedVenueNetworksData(
          networkList, venueNetworkApGroupList, networkDeepListList, networkIdsToIncompatible)

        return venueNetworkListQuery.data
          ? { data: aggregatedList }
          : { error: venueNetworkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      extraOptions: { maxRetries: 5 }
    }),
    apGroupNetworkList: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { apGroupNetworkListQuery,
          networkList,
          venueNetworkApGroupList,
          networkDeepListList } = await fetchApGroupNetworkVenueList(arg, fetchWithBQ)

        const aggregatedList = aggregatedVenueNetworksData(
          networkList, venueNetworkApGroupList, networkDeepListList)

        return apGroupNetworkListQuery.data
          ? { data: aggregatedList }
          : { error: apGroupNetworkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),


    networkVenueListV2: build.query<TableResult<Venue>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          networkVenuesListQuery,
          networkVenuesList,
          networkVenuesApGroupList,
          networkDeep
        } = await fetchNetworkVenueListV2(arg, fetchWithBQ)

        const aggregatedList = aggregatedNetworksVenueDataV2(
          networkVenuesList, networkVenuesApGroupList, networkDeep)

        return networkVenuesListQuery.data
          ? { data: aggregatedList }
          : { error: networkVenuesListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateNetworkDeep'], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),

    newNetworkVenueTable: build.query<TableResult<Venue>, RequestPayload<{ isTemplate?: boolean }>>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          error: networkVenuesListQueryError,
          networkVenuesList,
          networkViewmodel,
          networkDeep,
          venueIds
        } = await fetchRbacNetworkVenueList(arg, fetchWithBQ)

        if (networkVenuesListQueryError)
          return { error: networkVenuesListQueryError }

        const venueIdsToIncompatible:{ [key:string]: number } = {}
        try {
          const apCompatibilitiesReq = {
            ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesNetwork, arg.params),
            body: { filters: { venueIds } }
          }
          const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
          const apCompatibilitiesResponse = apCompatibilitiesQuery.data as ApCompatibilityResponse
          const apCompatibilities = apCompatibilitiesResponse.apCompatibilities as ApCompatibility[]
          apCompatibilities.forEach((item:ApCompatibility) => {
            venueIdsToIncompatible[item.id] = item.incompatible
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('networkVenueTable getApCompatibilitiesNetwork error:', e)
        }

        const aggregatedList = aggregatedRbacNetworksVenueData(
          networkVenuesList, networkViewmodel, networkDeep, venueIdsToIncompatible)

        return { data: aggregatedList }
      },
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateNetworkDeep'], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),

    networkVenueTableV2: build.query<TableResult<Venue>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          networkVenuesListQuery,
          networkVenuesList,
          networkVenuesApGroupList,
          networkDeep,
          venueIds
        } = await fetchNetworkVenueListV2(arg, fetchWithBQ)

        const venueIdsToIncompatible:{ [key:string]: number } = {}
        try {
          const apCompatibilitiesReq = {
            ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesNetwork, arg.params),
            body: { filters: { venueIds } }
          }
          const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
          const apCompatibilitiesResponse = apCompatibilitiesQuery.data as ApCompatibilityResponse
          const apCompatibilities = apCompatibilitiesResponse.apCompatibilities as ApCompatibility[]
          apCompatibilities.forEach((item:ApCompatibility) => {
            venueIdsToIncompatible[item.id] = item.incompatible
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('networkVenueTable getApCompatibilitiesNetwork error:', e)
        }
        const aggregatedList = aggregatedNetworksVenueDataV2(
          networkVenuesList, networkVenuesApGroupList, networkDeep, venueIdsToIncompatible)

        return networkVenuesListQuery.data
          ? { data: aggregatedList }
          : { error: networkVenuesListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateNetworkDeep'], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    venueNetworkListV2: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { venueNetworkListQuery,
          networkList,
          venueNetworkApGroupList,
          networkDeepListList } = await fetchVenueNetworkListV2(arg, fetchWithBQ)

        const aggregatedList = aggregatedVenueNetworksDataV2(
          networkList, venueNetworkApGroupList, networkDeepListList)

        return venueNetworkListQuery.data
          ? { data: aggregatedList }
          : { error: venueNetworkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      extraOptions: { maxRetries: 5 }
    }),
    venueRadioActiveNetworks: build.query<Network[], RequestPayload & { radio: RadioTypeEnum }>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const [networkActivationsQuery, networksQuery] = await Promise.all([
          fetchWithBQ({
            ...createHttpRequest(CommonUrlsInfo.networkActivations, arg.params),
            body: arg.payload
          }),
          fetchWithBQ({
            ...createHttpRequest(CommonUrlsInfo.getVenueNetworkList, arg.params),
            body: arg.payload
          })
        ]) as [{ data: { data: NetworkVenue[] } }, { data: { data: Network[] } }]
        const active = networkActivationsQuery.data.data.reduce(
          (active: Record<string, boolean>, network: NetworkVenue) => {
            if (network.allApGroupsRadioTypes?.includes(arg.radio)) {
              active[network.networkId as string] = true
            }
            return active
          },
          {} as Record<string, boolean>
        )
        return {
          data: networksQuery.data.data.filter(network => active[network.id])
        }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    venueNetworkTableV2: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { venueNetworkListQuery,
          networkList,
          venueNetworkApGroupList,
          networkDeepListList,
          networkIds } = await fetchVenueNetworkListV2(arg, fetchWithBQ)

        const networkIdsToIncompatible:{ [key:string]: number } = {}
        try {
          const apCompatibilitiesReq = {
            ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesVenue, arg.params),
            body: { filters: { networkIds } }
          }
          const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
          const apCompatibilitiesResponse = apCompatibilitiesQuery.data as ApCompatibilityResponse
          const apCompatibilities = apCompatibilitiesResponse.apCompatibilities as ApCompatibility[]
          apCompatibilities.forEach((item:ApCompatibility) => {
            networkIdsToIncompatible[item.id] = item.incompatible
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('venueNetworkTable getApCompatibilitiesVenue error:', e)
        }

        const aggregatedList = aggregatedVenueNetworksDataV2(
          networkList, venueNetworkApGroupList, networkDeepListList, networkIdsToIncompatible)

        return venueNetworkListQuery.data
          ? { data: aggregatedList }
          : { error: venueNetworkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      extraOptions: { maxRetries: 5 }
    }),
    newVenueNetworkTable: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          error: networkListQueryError,
          networkList,
          networkDeepListList,
          networkIds } = await fetchRbacVenueNetworkList(arg, fetchWithBQ)

        if (networkListQueryError)
          return { error: networkListQueryError }

        const networkIdsToIncompatible:{ [key:string]: number } = {}
        try {
          const apCompatibilitiesReq = {
            ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesVenue, arg.params),
            body: { filters: { networkIds } }
          }
          const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
          const apCompatibilitiesResponse = apCompatibilitiesQuery.data as ApCompatibilityResponse
          const apCompatibilities = apCompatibilitiesResponse.apCompatibilities as ApCompatibility[]
          apCompatibilities.forEach((item:ApCompatibility) => {
            networkIdsToIncompatible[item.id] = item.incompatible
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('venueNetworkTable getApCompatibilitiesVenue error:', e)
        }

        const aggregatedList = aggregatedRbacVenueNetworksData(
          arg.params?.venueId!, networkList,
          networkDeepListList, networkIdsToIncompatible)

        return { data: aggregatedList }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      extraOptions: { maxRetries: 5 }
    }),
    apGroupNetworkListV2: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { apGroupNetworkListQuery,
          networkList,
          venueNetworkApGroupList,
          networkDeepListList } = await fetchApGroupNetworkVenueListV2(arg, fetchWithBQ)

        const aggregatedList = aggregatedVenueNetworksDataV2(
          networkList, venueNetworkApGroupList, networkDeepListList)

        return apGroupNetworkListQuery.data
          ? { data: aggregatedList }
          : { error: apGroupNetworkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    newApGroupNetworkList: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          error: apGroupNetworkListQueryError,
          networkList,
          networkDeepListList
        } = await fetchRbacApGroupNetworkVenueList(arg, fetchWithBQ)

        if (apGroupNetworkListQueryError)
          return { error: apGroupNetworkListQueryError as FetchBaseQueryError }

        const aggregatedList = aggregatedRbacVenueNetworksData(
          arg.params?.venueId!,
          networkList, networkDeepListList)

        return { data: aggregatedList }
      },
      providesTags: [{ type: 'Network', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getApCompatibilitiesNetwork: build.query<ApCompatibilityResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApCompatibilitiesNetwork, params, { ...ignoreErrorModal })
        return{
          ...req,
          body: payload
        }
      }
    }),
    venueNetworkActivationsDataList: build.query<NetworkSaveData[], RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const networkActivations = {
          ...createHttpRequest(CommonUrlsInfo.networkActivations, arg.params),
          body: arg.payload
        }
        const networkActivationsQuery = await fetchWithBQ(networkActivations)
        const networkVenueList = networkActivationsQuery.data as TableResult<NetworkVenue>

        let networkDeepList = { response: [] } as { response: NetworkSaveData[] }

        if (networkVenueList && networkVenueList.data && networkVenueList.data.length > 0) {
          const networkIds = networkVenueList.data.map(item => item.networkId!) || []
          networkDeepList = await getNetworkDeepList(networkIds, fetchWithBQ)
        }

        return { data: networkDeepList.response }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }),
    venueNetworkActivationsViewModelList: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const typedPayload = arg.payload as Record<string, unknown>
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const networkListQuery = await fetchWithBQ({
          ...createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, apiCustomHeader),
          body: JSON.stringify({
            filters: { 'venueApGroups.venueId': [typedPayload.venueId] }
          }) })

        const networksList = networkListQuery.data as TableResult<WifiNetwork>

        // fetch vlan pool info
        const networkIds = networksList?.data.map(item => item.id!) || []
        if (networksList.data.length && (typedPayload?.fields as string[])?.includes('vlanPool')) {
          const vlanPoolListQuery = await fetchWithBQ({
            ...createHttpRequest( VlanPoolRbacUrls.getVLANPoolPolicyList, apiCustomHeader),
            body: JSON.stringify({
              fields: ['id', 'name', 'wifiNetworkIds'],
              filters: { wifiNetworkIds: networkIds }
            }) })

          const vlanPoolList = vlanPoolListQuery.data as TableResult<VLANPoolViewModelRbacType>

          networksList.data.forEach(network => {
            network.vlanPool = find(vlanPoolList.data, (item) => {
              return item.wifiNetworkIds?.includes(network.id)
            }) as BaseNetwork['vlanPool']
          })
        }

        return networksList
          ? { data: networksList as TableResult<Network> }
          : { error: networkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddNetwork'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }),
    dashboardOverview: build.query<Dashboard, RequestPayload>({
      query: ({ params }) => {
        const dashboardOverviewReq = createHttpRequest(CommonUrlsInfo.getDashboardOverview, params)
        return {
          ...dashboardOverviewReq
        }
      },
      providesTags: [{ type: 'Network', id: 'Overview' }]
    }),
    dashboardV2Overview: build.query<Dashboard, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(CommonUrlsInfo.getDashboardV2Overview, params),
          body: payload
        }
      },
      providesTags: [{ type: 'Network', id: 'Overview' }]
    }),
    externalProviders: build.query<ExternalProviders, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac ? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const externalProvidersReq = createHttpRequest(urlsInfo.getExternalProviders, params, apiCustomHeader)
        return {
          ...externalProvidersReq
        }
      }
    }),
    activateCertificateTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.activateCertificateTemplate, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    activateDpskService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.activateDpskService, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    activateMacRegistrationPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.activateMacRegistrationPool, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    activateVlanPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const headers = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiUrlsInfo.activateVlanPool, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      extraOptions: { maxRetries: 5 },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateNetwork'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }),
    deactivateVlanPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const headers = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiUrlsInfo.deactivateVlanPool, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      extraOptions: { maxRetries: 5 },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateNetwork'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }
    ),
    activateRadiusServer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(WifiRbacUrlsInfo.activateRadiusServer, params, GetApiVersionHeader(ApiVersionEnum.v1))
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }, { type: 'NetworkRadiusServer', id: 'DETAIL' }]
    }),
    deactivateRadiusServer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(WifiRbacUrlsInfo.deactivateRadiusServer, params, GetApiVersionHeader(ApiVersionEnum.v1))
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }, { type: 'NetworkRadiusServer', id: 'DETAIL' }]
    }),
    updateRadiusServerSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WifiRbacUrlsInfo.updateRadiusServerSettings, params, GetApiVersionHeader(ApiVersionEnum.v1)),
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }, { type: 'NetworkRadiusServer', id: 'DETAIL' }]
    }),
    getRadiusServerSettings: build.query<NetworkRadiusSettings, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(WifiRbacUrlsInfo.getRadiusServerSettings, params, GetApiVersionHeader(ApiVersionEnum.v1))
        }
      },
      providesTags: [{ type: 'NetworkRadiusServer', id: 'DETAIL' }]
    }),
    bindClientIsolation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.bindClientIsolation, params)
        return {
          ...req
        }
      }
    }),
    unbindClientIsolation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.unbindClientIsolation, params)
        return {
          ...req
        }
      }
    })
  })
})

const calculateNetworkActivated = (res?: NetworkVenue) => {
  const activatedObj = { isActivated: false, isDisabled: false, errors: [] as string[] }
  let errorsCounter = 0
  if (res && !res.isAllApGroups) {
    if (res.apGroups && res.apGroups.length) {
      res.apGroups.forEach(group => {
        if (group.id) {
          activatedObj.isActivated = true
        }
        if (group.validationError) {
          ++errorsCounter
          if (group.validationErrorReachedMaxConnectedNetworksLimit) {
            activatedObj.errors.push('validationErrorReachedMaxConnectedNetworksLimit')
          }
          if (group.validationErrorSsidAlreadyActivated) {
            activatedObj.errors.push('validationErrorSsidAlreadyActivated')
          }
          if (group.validationErrorReachedMaxConnectedCaptiveNetworksLimit) {
            activatedObj.errors.push('validationErrorReachedMaxConnectedCaptiveNetworksLimit')
          }
        }
      })
      if (errorsCounter === res.apGroups.length) {
        activatedObj.isDisabled = true
      }
    }
  } else if (res && res.isAllApGroups) {
    activatedObj.isActivated = true
  } else {
    activatedObj.isActivated = false
  }
  return activatedObj
}

// it will be removed after the wifi-consumer is closed
export const fetchNetworkVenueList = async (arg:any, fetchWithBQ:any) => {
  const networkVenuesListInfo = {
    ...createHttpRequest(arg.payload.isTemplate
      ? ConfigTemplateUrlsInfo.getVenuesTemplateList
      : CommonUrlsInfo.getVenuesList
    , arg.params),
    body: arg.payload
  }
  const networkVenuesListQuery = await fetchWithBQ(networkVenuesListInfo)
  const networkVenuesList = networkVenuesListQuery.data as TableResult<Venue>
  const venueIds:string[] = networkVenuesList.data?.filter(v => {
    if (v.aggregatedApStatus) {
      return Object.values(v.aggregatedApStatus || {}).reduce((a, b) => a + b, 0) > 0
    }
    return false
  }).map(v => v.id) || []

  const networkDeepListInfo = {
    ...createHttpRequest(CommonUrlsInfo.getNetworkDeepList, arg.params),
    body: [arg.params?.networkId]
  }
  const networkDeepListQuery = await fetchWithBQ(networkDeepListInfo)
  const networkDeepList = networkDeepListQuery.data as { response: NetworkDetail[] }
  const networkDeep = Array.isArray(networkDeepList?.response) ?
    networkDeepList?.response[0] : undefined
  let networkVenuesApGroupList = {} as { response: NetworkVenue[] }

  if (networkDeep?.wlan?.ssid && arg.params?.networkId) {
    const networkVenuesApGroupInfo = {
      ...createHttpRequest(CommonUrlsInfo.venueNetworkApGroup, arg.params),
      body: networkVenuesList.data.map(item => ({
        venueId: item.id,
        ssids: [networkDeep?.wlan?.ssid],
        networkId: arg.params?.networkId
      }))
    }
    const networkVenuesApGroupQuery = await fetchWithBQ(networkVenuesApGroupInfo)
    networkVenuesApGroupList = networkVenuesApGroupQuery.data as { response: NetworkVenue[] }
  }

  return { networkVenuesListQuery, networkVenuesList, networkVenuesApGroupList, networkDeep, venueIds }

}

export const aggregatedNetworksVenueData = (venueList: TableResult<Venue>,
  venueNetworkApGroupList:{ response: NetworkVenue[] },
  networkDeep?: NetworkDetail,
  venueIdsToIncompatible:{ [key:string]: number } = {}
) => {
  const data:Venue[] = []
  venueList.data.forEach(item => {
    const networkApGroup = venueNetworkApGroupList?.response?.find(
      i => i.venueId === item.id
    )
    const deepVenue = networkDeep?.venues?.find(
      i => i.venueId === item.id
    )
    data.push({
      ...item,
      activated: calculateNetworkActivated(networkApGroup),
      deepVenue: deepVenue,
      incompatible: venueIdsToIncompatible[item.id] ?? 0
    })
  })
  return {
    ...venueList,
    data
  }
}

export const fetchVenueNetworkList = async (arg: any, fetchWithBQ: any) => {
  const venueNetworkListInfo = {
    ...createHttpRequest(arg.payload.isTemplate
      ? ConfigTemplateUrlsInfo.getVenueNetworkTemplateList
      : CommonUrlsInfo.getVenueNetworkList, arg.params),
    body: arg.payload
  }
  const venueNetworkListQuery = await fetchWithBQ(venueNetworkListInfo)
  const networkList = venueNetworkListQuery.data as TableResult<Network>

  let venueNetworkApGroupList = {} as { response: NetworkVenue[] }
  let networkDeepListList = {} as { response: NetworkDetail[] }

  const networkIds = networkList?.data?.map(item => item.id) || []

  if (networkList && networkList.data.length > 0) {
    const venueNetworkApGroupInfo = {
      ...createHttpRequest(CommonUrlsInfo.venueNetworkApGroup, arg.params),
      body: networkList.data.map(item => ({
        networkId: item.id,
        ssids: [item.ssid],
        venueId: arg.params?.venueId
      }))
    }
    const venueNetworkApGroupQuery = await fetchWithBQ(venueNetworkApGroupInfo)
    venueNetworkApGroupList = venueNetworkApGroupQuery.data as { response: NetworkVenue[] }

    const networkDeepListInfo = {
      ...createHttpRequest(CommonUrlsInfo.getNetworkDeepList, arg.params),
      body: networkIds
    }
    const networkDeepListQuery = await fetchWithBQ(networkDeepListInfo)
    networkDeepListList = networkDeepListQuery.data as { response: NetworkDetail[] }
  }
  return { venueNetworkListQuery,
    networkList,
    venueNetworkApGroupList,
    networkDeepListList,
    networkIds
  }
}

export const aggregatedVenueNetworksData = (networkList: TableResult<Network>,
  venueNetworkApGroupList:{ response: NetworkVenue[] },
  networkDeepListList:{ response: NetworkDetail[] },
  apCompatibilities:{ [key:string]: number } = {}) => {
  const data:Network[] = []
  networkList.data.forEach(item => {
    const networkApGroup = venueNetworkApGroupList?.response?.find(
      i => i.networkId === item.id
    )
    const deepNetwork = networkDeepListList?.response?.find(
      i => i.id === item.id
    )
    if (item?.dsaeOnboardNetwork) {
      item = { ...item,
        ...{ children: [{ ...item?.dsaeOnboardNetwork,
          isOnBoarded: true,
          activated: calculateNetworkActivated(networkApGroup) } as Network] }
      }
    }
    if (networkApGroup) {
      data.push({
        ...item,
        activated: calculateNetworkActivated(networkApGroup),
        deepNetwork: deepNetwork,
        incompatible: apCompatibilities[item.id] ?? 0
      })
    }
  })

  return {
    ...networkList,
    data
  }
}

export const fetchApGroupNetworkVenueList = async (arg:any, fetchWithBQ:any) => {
  const apGroupNetworkListInfo = {
    ...createHttpRequest(arg.payload.isTemplate
      ? VenueConfigTemplateUrlsInfo.getApGroupNetworkList
      : CommonUrlsInfo.getApGroupNetworkList, arg.params),
    body: arg.payload
  }

  const apGroupNetworkListQuery = await fetchWithBQ(apGroupNetworkListInfo)
  const networkList = apGroupNetworkListQuery.data as TableResult<Network>

  let venueNetworkApGroupList = {} as { response: NetworkVenue[] }
  let networkDeepListList = {} as { response: NetworkDetail[] }

  if (networkList && networkList.data.length > 0) {
    const venueNetworkApGroupInfo = {
      ...createHttpRequest(CommonUrlsInfo.venueNetworkApGroup, arg.params),
      body: networkList.data.map(item => ({
        networkId: item.id,
        ssids: [item.ssid],
        venueId: arg.params?.venueId
      }))
    }
    const venueNetworkApGroupQuery = await fetchWithBQ(venueNetworkApGroupInfo)
    venueNetworkApGroupList = venueNetworkApGroupQuery.data as { response: NetworkVenue[] }

    const networkDeepListInfo = {
      ...createHttpRequest(CommonUrlsInfo.getNetworkDeepList, arg.params),
      body: networkList.data.map(item => item.id)
    }
    const networkDeepListQuery = await fetchWithBQ(networkDeepListInfo)
    networkDeepListList = networkDeepListQuery.data as { response: NetworkDetail[] }
  }

  return { apGroupNetworkListQuery,
    networkList,
    venueNetworkApGroupList,
    networkDeepListList
  }
}


// API V2
const apiV2CustomHeader = {
  'Content-Type': 'application/vnd.ruckus.v2+json',
  'Accept': 'application/vnd.ruckus.v2+json'
}

export const fetchNetworkVenueListV2 = async (arg:any, fetchWithBQ:any) => {
  const networkVenuesListInfo = {
    ...createHttpRequest(arg.payload.isTemplate
      ? ConfigTemplateUrlsInfo.getVenuesTemplateList
      : CommonUrlsInfo.getVenuesList
    , arg.params),
    body: arg.payload
  }
  const networkVenuesListQuery = await fetchWithBQ(networkVenuesListInfo)
  const networkVenuesList = networkVenuesListQuery.data as TableResult<Venue>
  const venueIds:string[] = networkVenuesList.data?.filter(v => {
    if (v.aggregatedApStatus) {
      return Object.values(v.aggregatedApStatus || {}).reduce((a, b) => a + b, 0) > 0
    }
    return false
  }).map(v => v.id) || []

  const networkDeepList = await getNetworkDeepList([arg.params?.networkId], fetchWithBQ, arg.payload.isTemplate)
  const networkDeep = Array.isArray(networkDeepList?.response) ?
    networkDeepList?.response[0] : undefined
  let networkVenuesApGroupList = {} as { data: NetworkVenue[] }

  if (networkDeep?.wlan?.ssid && arg.params?.networkId) {
    const filters = networkVenuesList.data.map(item => ({
      venueId: item.id,
      networkId: arg.params?.networkId
    }))

    const networkVenuesApGroupInfo = {
      ...createHttpRequest(arg.payload.isTemplate
        ? VenueConfigTemplateUrlsInfo.networkActivations
        : CommonUrlsInfo.networkActivations, arg.params,
      arg.payload.isTemplate
        ? {}
        : apiV2CustomHeader),
      body: JSON.stringify({ filters })
    }
    const networkVenuesApGroupQuery = await fetchWithBQ(networkVenuesApGroupInfo)
    networkVenuesApGroupList = networkVenuesApGroupQuery.data as { data: NetworkVenue[] }
  }

  return { networkVenuesListQuery, networkVenuesList, networkVenuesApGroupList, networkDeep, venueIds }

}

export const aggregatedNetworksVenueDataV2 = (venueList: TableResult<Venue>,
  venueNetworkApGroupList:{ data: NetworkVenue[] },
  networkDeep?: NetworkDetail,
  venueIdsToIncompatible:{ [key:string]: number } = {}
) => {
  const data:Venue[] = []
  const venueNetworkApGroupsData = venueNetworkApGroupList?.data
  venueList.data.forEach(item => {
    const networkApGroup = venueNetworkApGroupsData?.find(
      i => i.venueId === item.id
    )
    const deepVenue = networkDeep?.venues?.find(
      i => i.venueId === item.id
    )
    data.push({
      ...item,
      activated: calculateNetworkActivated(networkApGroup),
      deepVenue: deepVenue,
      incompatible: venueIdsToIncompatible[item.id] ?? 0
    })
  })
  return {
    ...venueList,
    data
  }
}

export const fetchVenueNetworkListV2 = async (arg: any, fetchWithBQ: any) => {
  const venueNetworkListInfo = {
    ...createHttpRequest(arg.payload.isTemplate
      ? ConfigTemplateUrlsInfo.getVenueNetworkTemplateList
      : CommonUrlsInfo.getVenueNetworkList, arg.params),
    body: arg.payload
  }

  const venueNetworkListQuery = await fetchWithBQ(venueNetworkListInfo)
  const networkList = venueNetworkListQuery.data as TableResult<Network>

  let venueNetworkApGroupList = {} as { data: NetworkVenue[] }
  let networkDeepListList = {} as { response: NetworkDetail[] }

  const networkIds = networkList?.data?.map(item => item.id) || []

  if (networkIds.length > 0) {
    const filters = networkList.data.map(item => ({
      networkId: item.id,
      venueId: arg.params?.venueId
    }))

    const venueNetworkApGroupInfo = {
      ...createHttpRequest(arg.payload.isTemplate
        ? VenueConfigTemplateUrlsInfo.networkActivations
        : CommonUrlsInfo.networkActivations, arg.params,
      arg.payload.isTemplate
        ? {}
        : apiV2CustomHeader),
      body: JSON.stringify({ filters })
    }
    const venueNetworkApGroupQuery = await fetchWithBQ(venueNetworkApGroupInfo)
    venueNetworkApGroupList = venueNetworkApGroupQuery.data as { data: NetworkVenue[] }
    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, arg.payload.isTemplate)
  }
  return { venueNetworkListQuery,
    networkList,
    venueNetworkApGroupList,
    networkDeepListList,
    networkIds
  }
}

export const aggregatedVenueNetworksDataV2 = (networkList: TableResult<Network>,
  venueNetworkApGroupList:{ data: NetworkVenue[] },
  networkDeepListList:{ response: NetworkDetail[] },
  apCompatibilities:{ [key:string]: number } = {}) => {
  const data:Network[] = []
  const venueNetworkApGroupsData = venueNetworkApGroupList?.data
  networkList.data.forEach(item => {
    const networkApGroup = venueNetworkApGroupsData?.find(
      i => i.networkId === item.id
    )
    const deepNetwork = networkDeepListList?.response?.find(
      i => i.id === item.id
    )

    if (item?.dsaeOnboardNetwork) {
      item = { ...item,
        ...{ children: [{ ...item?.dsaeOnboardNetwork,
          isOnBoarded: true,
          activated: calculateNetworkActivated(networkApGroup) } as Network] }
      }
    }

    data.push({
      ...item,
      activated: calculateNetworkActivated(networkApGroup),
      deepNetwork: deepNetwork,
      incompatible: apCompatibilities[item.id] ?? 0
    })
  })

  return {
    ...networkList,
    data
  }
}

export const fetchApGroupNetworkVenueListV2 = async (arg:any, fetchWithBQ:any) => {
  const apGroupNetworkListInfo = {
    ...createHttpRequest(arg.payload.isTemplate
      ? VenueConfigTemplateUrlsInfo.getApGroupNetworkList
      : CommonUrlsInfo.getApGroupNetworkList, arg.params),
    body: arg.payload
  }

  const apGroupNetworkListQuery = await fetchWithBQ(apGroupNetworkListInfo)
  const networkList = apGroupNetworkListQuery.data as TableResult<Network>
  let venueNetworkApGroupList = {} as { data: NetworkVenue[] }
  let networkDeepListList = {} as { response: NetworkDetail[] }

  if (networkList && networkList.data.length > 0) {
    const filters = networkList.data.map(item => ({
      networkId: item.id,
      venueId: arg.params?.venueId
    }))
    const networkIds = networkList.data.map(item => item.id)

    const venueNetworkApGroupInfo = {
      ...createHttpRequest(arg.payload.isTemplate
        ? VenueConfigTemplateUrlsInfo.networkActivations
        : CommonUrlsInfo.networkActivations, arg.params,
      arg.payload.isTemplate
        ? {}
        : apiV2CustomHeader),
      body: JSON.stringify({ filters })
    }
    const venueNetworkApGroupQuery = await fetchWithBQ(venueNetworkApGroupInfo)
    venueNetworkApGroupList = venueNetworkApGroupQuery.data as { data: NetworkVenue[] }

    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, arg.payload.isTemplate)
  }

  return { apGroupNetworkListQuery,
    networkList,
    venueNetworkApGroupList,
    networkDeepListList
  }
}

export const {
  useNetworkListQuery,
  useLazyNetworkListQuery,
  useNetworkTableQuery,
  useWifiNetworkListQuery,
  useLazyWifiNetworkListQuery,
  useWifiNetworkTableQuery,
  useGetNetworkQuery,
  useLazyGetNetworkQuery,
  useGetVenueNetworkApGroupQuery,
  useLazyGetVenueNetworkApGroupQuery,
  useNetworkDetailHeaderQuery,
  useNetworkVenueListQuery,
  useNetworkVenueTableQuery,
  useNetworkVenueListV2Query,
  useNewNetworkVenueTableQuery,
  useNetworkVenueTableV2Query,
  useVenueNetworkActivationsDataListQuery,
  useVenueNetworkActivationsViewModelListQuery,
  useAddNetworkMutation,
  useUpdateNetworkMutation,
  useDeleteNetworkMutation,
  useAddNetworkVenueMutation,
  useAddNetworkVenuesMutation,
  useUpdateNetworkVenueMutation,
  useUpdateNetworkVenuesMutation,
  useDeleteNetworkVenueMutation,
  useDeleteNetworkVenuesMutation,
  useApNetworkListQuery,
  useApGroupNetworkListQuery,
  useLazyApGroupNetworkListQuery,
  useVenueNetworkListQuery,
  useVenueNetworkTableQuery,
  useVenueNetworkListV2Query,
  useNewVenueNetworkTableQuery,
  useVenueRadioActiveNetworksQuery,
  useVenueNetworkTableV2Query,
  useApGroupNetworkListV2Query,
  useLazyApGroupNetworkListV2Query,
  useNewApGroupNetworkListQuery,
  useLazyNewApGroupNetworkListQuery,
  useGetApCompatibilitiesNetworkQuery,
  useLazyGetApCompatibilitiesNetworkQuery,
  useDashboardOverviewQuery,
  useDashboardV2OverviewQuery,
  useExternalProvidersQuery,
  useActivateCertificateTemplateMutation,
  useActivateDpskServiceMutation,
  useActivateMacRegistrationPoolMutation,
  useActivateVlanPoolMutation,
  useDeactivateVlanPoolMutation,
  useActivateRadiusServerMutation,
  useDeactivateRadiusServerMutation,
  useUpdateRadiusServerSettingsMutation,
  useGetRadiusServerSettingsQuery,
  useBindClientIsolationMutation,
  useUnbindClientIsolationMutation
} = networkApi

export const aggregatedNetworkCompatibilitiesData = (networkList: TableResult<Network>,
  apCompatibilities: { [key:string]: number }) => {
  networkList.data = networkList.data.map(item => ({
    ...transformNetwork(item),
    incompatible: apCompatibilities[item.id]
  }))
  return networkList
}

export const aggregatedWifiNetworkCompatibilitiesData = (networkList: TableResult<WifiNetwork>,
  apCompatibilities: { [key:string]: number }) => {
  networkList.data = networkList.data.map(item => ({
    ...transformWifiNetwork(item),
    incompatible: apCompatibilities[item.id]
  }))
  return networkList
}

export { baseNetworkApi }

