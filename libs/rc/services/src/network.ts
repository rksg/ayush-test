import { QueryReturnValue }                                                   from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { createApi, fetchBaseQuery, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  NetworkVenue,
  NetworkSaveData,
  onSocketActivityChanged,
  refetchByUsecase,
  RequestPayload,
  showActivityMessage,
  TableResult,
  Dashboard,
  Network,
  Venue,
  NetworkDetailHeader,
  CommonResult,
  NetworkDetail,
  RadiusValidate,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'

export const baseNetworkApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'networkApi',
  tagTypes: ['Network', 'Venue'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

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
          ...item,
          activated: item.activated ?? { isActivated: false }
        }))
        return result
      },
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          if (msg.status !== 'SUCCESS') return
          if (!['DeleteNetwork', 'AddNetworkDeep', 'UpdateNetworkDeep'].includes(msg.useCase))
            return

          showActivityMessage(msg, ['AddNetworkDeep', 'DeleteNetwork', 'UpdateNetworkDeep'], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
          })
        })
      }
    }),
    addNetwork: build.mutation<Network, RequestPayload>({
      query: ({ params, payload }) => {
        const createNetworkReq = createHttpRequest(WifiUrlsInfo.addNetworkDeep, params)
        return {
          ...createNetworkReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }]
    }),
    updateNetwork: build.mutation<Network, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateNetworkDeep, params)
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
        const req = createHttpRequest(WifiUrlsInfo.addNetworkVenue, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    deleteNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteNetworkVenue, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    getNetwork: build.query<NetworkSaveData | undefined, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetch) {
        if (!params?.networkId) return Promise.resolve({ data: undefined } as QueryReturnValue<
          undefined,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)
        const result = await fetch(createHttpRequest(WifiUrlsInfo.getNetwork, params))
        return result as QueryReturnValue<NetworkSaveData,
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
          showActivityMessage(msg,
            ['AddNetworkVenue', 'DeleteNetworkVenue', 'UpdateNetworkDeep'], () => {
              api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
            })
        })
      }
    }),
    networkVenueList: build.query<TableResult<Venue>, RequestPayload>({
      query: ({ params, payload }) => {
        const venueListReq = createHttpRequest(CommonUrlsInfo.getNetworksVenuesList, params)
        return{
          ...venueListReq,
          body: payload
        }
      },
      transformResponse (result: TableResult<Venue>) {
        result.data = result.data.map(item => ({
          ...item,
          activated: item.activated ?? { isActivated: false }
        }))
        return result
      },
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          refetchByUsecase(msg, ['UpdateNetworkDeep'], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      }
    }),
    venueNetworkList: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const venueNetworkListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getVenueNetworkList, arg.params),
          body: arg.payload
        }
        const venueNetworkListQuery = await fetchWithBQ(venueNetworkListInfo)
        const networkList = venueNetworkListQuery.data as TableResult<Network>

        const venueNetworkApGroupInfo = {
          ...createHttpRequest(CommonUrlsInfo.venueNetworkApGroup, arg.params),
          body: networkList.data.map(item => ({
            networkId: item.id,
            ssids: [item.ssid],
            venueId: arg.params?.venueId
          }))
        }
        const venueNetworkApGroupQuery = await fetchWithBQ(venueNetworkApGroupInfo)
        const venueNetworkApGroupList = 
              venueNetworkApGroupQuery.data as { response: NetworkVenue[] }

        const networkDeepListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getNetworkDeepList, arg.params),
          body: networkList.data.map(item => item.id)
        }
        const networkDeepListQuery = await fetchWithBQ(networkDeepListInfo)
        const networkDeepListList = networkDeepListQuery.data as { response: NetworkDetail[] }

        const aggregatedList = aggregatedVenueNetworksData(
          networkList, venueNetworkApGroupList, networkDeepListList)

        return venueNetworkListQuery.data
          ? { data: aggregatedList }
          : { error: venueNetworkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    dashboardOverview: build.query<Dashboard, RequestPayload>({
      query: ({ params }) => {
        const dashboardOverviewReq = createHttpRequest(CommonUrlsInfo.getDashboardOverview, params)
        return {
          ...dashboardOverviewReq
        }
      }
    }),
    validateRadius: build.query<RadiusValidate, RequestPayload>({
      query: ({ params, payload }) => {
        const validateRadiusReq = createHttpRequest(CommonUrlsInfo.validateRadius, params)
        return {
          ...validateRadiusReq,
          body: payload
        }
      }
    })
  })
})

export const aggregatedVenueNetworksData = (networkList: TableResult<Network>, 
  venueNetworkApGroupList:{ response: NetworkVenue[] }, 
  networkDeepListList:{ response: NetworkDetail[] }) => {
  const data:Network[] = []
  networkList.data.forEach(item => {
    const networkApGroup = venueNetworkApGroupList?.response?.find(
      i => i.networkId === item.id
    )
    const deepNetwork = networkDeepListList?.response?.find(
      i => i.id === item.id
    )
    if (networkApGroup) {
      data.push({
        ...item,
        activated: calculateNetworkActivated(networkApGroup),
        deepNetwork: deepNetwork
      })
    }
  })

  return {
    ...networkList,
    data
  }
}

const calculateNetworkActivated = (res: NetworkVenue) => {
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
  } else {
    activatedObj.isActivated = true
  }
  return activatedObj
}

export const {
  useNetworkListQuery,
  useLazyNetworkListQuery,
  useGetNetworkQuery,
  useNetworkDetailHeaderQuery,
  useNetworkVenueListQuery,
  useAddNetworkMutation,
  useUpdateNetworkMutation,
  useDeleteNetworkMutation,
  useAddNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useVenueNetworkListQuery,
  useDashboardOverviewQuery,
  useValidateRadiusQuery,
  useLazyValidateRadiusQuery
} = networkApi
