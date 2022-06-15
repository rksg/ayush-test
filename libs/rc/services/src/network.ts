import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { message }                   from 'antd'

import {
  CommonUrlsInfo,
  createHttpRequest,
  onSocketActivityChanged,
  RequestPayload,
  TableResult
} from '@acx-ui/rc/utils'

import { Network, Venue, NetworkDetail, CommonResult, Dashboard } from './types'

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
      providesTags: ['Network'],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          if (msg.status !== 'SUCCESS') return
          if (!['DeleteNetwork', 'AddNetworkDeep'].includes(msg.useCase)) return

          if (msg.useCase === 'AddNetworkDeep') message.success('Created successfully')

          api.dispatch(networkApi.util.invalidateTags(['Network']))
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
      invalidatesTags: ['Network']
    }),
    addNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.addNetworkVenue, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'detail' }]
    }),
    deleteNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.deleteNetworkVenue, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'detail' }]
    }),
    getNetwork: build.query<NetworkDetail, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getNetwork, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Network', id: 'detail' }]
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
        return{
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
  useVenueListQuery,
  useDashboardOverviewQuery,
  useAddNetworkVenueMutation,
  useDeleteNetworkVenueMutation
} = networkApi
