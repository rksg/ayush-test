import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  NetworkVenue,
  onSocketActivityChanged,
  refetchByUsecase,
  RequestPayload,
  showActivityMessage,
  TableResult
} from '@acx-ui/rc/utils'

import { Network, Venue, NetworkDetailHeader, NetworkDetail, CommonResult, Dashboard } from './types'

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
          showActivityMessage(msg, ['AddNetworkDeep', 'DeleteNetwork'], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
          })
        })
      }
    }),
    createNetwork: build.mutation<Network, RequestPayload>({
      query: ({ params, payload }) => {
        const createNetworkReq = createHttpRequest(CommonUrlsInfo.addNetworkDeep, params)
        return {
          ...createNetworkReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }]
    }),
    updateNetworkDeep: build.mutation<Network, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateNetworkDeep, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }]
    }),
    deleteNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.deleteNetwork, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }]
    }),
    addNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.addNetworkVenue, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    deleteNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.deleteNetworkVenue, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    getNetwork: build.query<NetworkDetail, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getNetwork, params)
        return{
          ...req
        }
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
    venueList: build.query<TableResult<Venue>, RequestPayload>({
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

        const tmp:Network[] = []
        networkList.data.forEach(item => {
          const networkApGroup = venueNetworkApGroupList?.response?.find(
            i => i.networkId === item.id
          )
          const deepNetwork = networkDeepListList?.response?.find(
            i => i.id === item.id
          )
          if (networkApGroup) {
            tmp.push({
              ...item,
              activated: calculateNetworkActivated(networkApGroup),
              deepNetwork: deepNetwork
            })
          }
        })

        const aggregatedList = {
          ...networkList,
          data: tmp
        }

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
    })
  })
})

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
  useCreateNetworkMutation,
  useUpdateNetworkDeepMutation,
  useDeleteNetworkMutation,
  useVenueListQuery,
  useAddNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useVenueNetworkListQuery,
  useDashboardOverviewQuery
} = networkApi
