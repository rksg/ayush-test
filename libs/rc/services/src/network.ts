import { QueryReturnValue }                                                   from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { createApi, fetchBaseQuery, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
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
  CommonResult
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
    updateNetwork: build.mutation<Network, RequestPayload>({
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
    getNetwork: build.query<NetworkSaveData | undefined, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetch) {
        if (!params?.networkId) return Promise.resolve({ data: undefined } as QueryReturnValue<
          undefined,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)
        const result = await fetch(createHttpRequest(CommonUrlsInfo.getNetwork, params))
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
export const {
  useNetworkListQuery,
  useLazyNetworkListQuery,
  useGetNetworkQuery,
  useNetworkDetailHeaderQuery,
  useCreateNetworkMutation,
  useUpdateNetworkMutation,
  useDeleteNetworkMutation,
  useVenueListQuery,
  useAddNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useDashboardOverviewQuery
} = networkApi
