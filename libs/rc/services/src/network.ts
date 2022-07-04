import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  onSocketActivityChanged,
  RequestPayload,
  showTxToast,
  TableResult,
  TxStatus
} from '@acx-ui/rc/utils'

import { Network, Venue, NetworkDetailHeader, NetworkDetail, CommonResult, Dashboard } from './types'

export const baseNetworkApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'networkApi',
  tagTypes: ['Network'],
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
          if (msg.status !== TxStatus.SUCCESS) return
          if (!['DeleteNetwork', 'AddNetworkDeep'].includes(msg.useCase)) return
          showTxToast(msg)
          api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
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
    addNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.addNetworkVenue, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    deleteNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.deleteNetworkVenue, params)
        return {
          ...req
        }
      }
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
          if (msg.status !== TxStatus.SUCCESS) return
          if (!['AddNetworkVenue', 'DeleteNetworkVenue'].includes(msg.useCase)) return
          showTxToast(msg)
          api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
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
  useCreateNetworkMutation,
  useGetNetworkQuery,
  useNetworkDetailHeaderQuery,
  useVenueListQuery,
  useDashboardOverviewQuery,
  useAddNetworkVenueMutation,
  useDeleteNetworkVenueMutation
} = networkApi
