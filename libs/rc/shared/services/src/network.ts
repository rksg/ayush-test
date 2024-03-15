/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { QueryReturnValue }                        from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  NetworkVenue,
  NetworkSaveData,
  onSocketActivityChanged,
  onActivityMessageReceived,
  TableResult,
  Dashboard,
  Network,
  Venue,
  NetworkDetailHeader,
  CommonResult,
  NetworkDetail,
  WifiUrlsInfo,
  ExternalProviders,
  ApCompatibility,
  ApCompatibilityResponse,
  transformNetwork,
  WifiNetwork,
  ConfigTemplateUrlsInfo
} from '@acx-ui/rc/utils'
import { baseNetworkApi }                      from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'


const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

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
          onActivityMessageReceived(msg,
            ['AddNetwork', 'UpdateNetwork', 'DeleteNetwork'], () => {
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
        const networkIds = networkList?.data?.map(n => n.id) || []
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
          onActivityMessageReceived(msg,
            ['AddNetwork', 'UpdateNetwork', 'DeleteNetwork'], () => {
              api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
            })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    wifiNetworkList: build.query<TableResult<WifiNetwork>, RequestPayload>({
      query: ({ params, payload }) => {
        const networkListReq = createHttpRequest(CommonUrlsInfo.getWifiNetworksList, params)
        return {
          ...networkListReq,
          body: payload
        }
      },
      transformResponse (result: TableResult<WifiNetwork>) {
        result.data = result.data.map(item => ({
          ...transformNetwork(item)
        })) as WifiNetwork[]
        return result
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['AddNetwork', 'UpdateNetwork', 'DeleteNetwork'], () => {
              api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
            })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    addNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const createNetworkReq = createHttpRequest(WifiUrlsInfo.addNetworkDeep, params, RKS_NEW_UI)
        return {
          ...createNetworkReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }]
    }),
    updateNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateNetworkDeep, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    deleteNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteNetwork, params)
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateNetworkVenue, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
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
      async queryFn ({ params }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.networkId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)
        const networkQuery = await fetchWithBQ(
          createHttpRequest(WifiUrlsInfo.getNetwork, params, RKS_NEW_UI)
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
          onActivityMessageReceived(msg,
            [
              'AddNetworkVenue',
              'AddNetworkVenueMappings',
              'DeleteNetworkVenue',
              'DeleteNetworkVenues',
              'UpdateNetworkDeep',
              'UpdateNetworkVenue'
            ], () => {
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
      query: ({ params }) => {
        const externalProvidersReq = createHttpRequest(CommonUrlsInfo.getExternalProviders, params)
        return {
          ...externalProvidersReq
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
  const venueIds:string[] = []
  networkVenuesList.data.forEach(item => venueIds.push(item.id))

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
    ...createHttpRequest(CommonUrlsInfo.getApGroupNetworkList, arg.params),
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
  const venueIds:string[] = []
  networkVenuesList.data.forEach(item => venueIds.push(item.id))

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
      ...createHttpRequest(CommonUrlsInfo.networkActivations, arg.params, apiV2CustomHeader),
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
      ...createHttpRequest(CommonUrlsInfo.networkActivations, arg.params, apiV2CustomHeader),
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
    ...createHttpRequest(CommonUrlsInfo.getApGroupNetworkList, arg.params),
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
      ...createHttpRequest(CommonUrlsInfo.networkActivations, arg.params, apiV2CustomHeader),
      body: JSON.stringify({ filters })
    }
    const venueNetworkApGroupQuery = await fetchWithBQ(venueNetworkApGroupInfo)
    venueNetworkApGroupList = venueNetworkApGroupQuery.data as { data: NetworkVenue[] }

    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ)
  }

  return { apGroupNetworkListQuery,
    networkList,
    venueNetworkApGroupList,
    networkDeepListList
  }
}

const getNetworkDeepList = async (networkIds: string[], fetchWithBQ:any, isTemplate: boolean = false) => {
  const networkDeepList: NetworkDetail[] = []
  for (let i=0; i<networkIds.length; i++) {
    const networkQuery = await fetchWithBQ(createHttpRequest(
      isTemplate ? ConfigTemplateUrlsInfo.getNetworkTemplate : WifiUrlsInfo.getNetwork
      , { networkId: networkIds[i] }))
    networkDeepList.push(networkQuery.data)
  }

  return { response: networkDeepList }
}



export const {
  useNetworkListQuery,
  useLazyNetworkListQuery,
  useNetworkTableQuery,
  useWifiNetworkListQuery,
  useGetNetworkQuery,
  useLazyGetNetworkQuery,
  useGetVenueNetworkApGroupQuery,
  useLazyGetVenueNetworkApGroupQuery,
  useNetworkDetailHeaderQuery,
  useNetworkVenueListQuery,
  useNetworkVenueTableQuery,
  useNetworkVenueListV2Query,
  useNetworkVenueTableV2Query,
  useVenueNetworkActivationsDataListQuery,
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
  useVenueNetworkTableV2Query,
  useApGroupNetworkListV2Query,
  useLazyApGroupNetworkListV2Query,
  useGetApCompatibilitiesNetworkQuery,
  useLazyGetApCompatibilitiesNetworkQuery,
  useDashboardOverviewQuery,
  useDashboardV2OverviewQuery,
  useExternalProvidersQuery
} = networkApi

export const aggregatedNetworkCompatibilitiesData = (networkList: TableResult<Network>,
  apCompatibilities: { [key:string]: number }) => {
  networkList.data = networkList.data.map(item => ({
    ...transformNetwork(item),
    incompatible: apCompatibilities[item.id]
  })) as Network[]
  return networkList
}

export { baseNetworkApi }

