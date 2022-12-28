import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonResult,
  createHttpRequest,
  EdgeDnsServers,
  EdgeSaveData,
  EdgeUrlsInfo,
  EdgeViewModel,
  RequestPayload,
  TableResult
} from '@acx-ui/rc/utils'

export const baseEdgeApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'edgeApi',
  tagTypes: ['Edge'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const edgeApi = baseEdgeApi.injectEndpoints({
  endpoints: (build) => ({
    addEdge: build.mutation<EdgeSaveData, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.addEdge)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }]
    }),
    getEdge: build.query<EdgeSaveData, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdge, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }]
    }),
    updateEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateEdge, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }, { type: 'Edge', id: 'DETAIL' }]
    }),
    getEdgeList: build.query<TableResult<EdgeViewModel>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'LIST' }]
    }),
    deleteEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        if(payload){ //delete multiple rows
          const req = createHttpRequest(EdgeUrlsInfo.deleteEdges)
          return {
            ...req,
            body: payload
          }
        }else{ //delete single row
          const req = createHttpRequest(EdgeUrlsInfo.deleteEdge, params)
          return {
            ...req
          }
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }]
    }),
    sendOtp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.sendOtp, params)
        return {
          ...req,
          body: { otpState: 'RENEW' }
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }]
    }),
    getDnsServers: build.query<EdgeDnsServers, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getDnsServers, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }]
    }),
    updateDnsServers: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateDnsServers, params)
        return {
          ...req,
          body: payload
        }
      }
    })
  })
})

export const {
  useAddEdgeMutation,
  useGetEdgeQuery,
  useUpdateEdgeMutation,
  useGetEdgeListQuery,
  useLazyGetEdgeListQuery,
  useDeleteEdgeMutation,
  useSendOtpMutation,
  useGetDnsServersQuery,
  useUpdateDnsServersMutation
} = edgeApi
