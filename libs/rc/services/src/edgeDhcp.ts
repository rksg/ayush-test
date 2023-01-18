import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonResult,
  createHttpRequest,
  EdgeDhcpSetting,
  EdgeDhcpUrls,
  RequestPayload,
  TableResult
} from '@acx-ui/rc/utils'

export const baseEdgeDhcpApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'edgeDhcpApi',
  tagTypes: ['EdgeDhcp'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const edgeDhcpApi = baseEdgeDhcpApi.injectEndpoints({
  endpoints: (build) => ({
    addEdgeDhcpService: build.mutation<EdgeDhcpSetting, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeDhcpUrls.addDHCPService)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
    }),
    updateEdgeDhcp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeDhcpUrls.updateDHCPService, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }, { type: 'EdgeDhcp', id: 'DETAIL' }]
    }),
    deleteEdgeDhcp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        if(payload){ //delete multiple rows
          const req = createHttpRequest(EdgeDhcpUrls.bulkdeleteDhcpServices)
          return {
            ...req,
            body: payload
          }
        }else{ //delete single row
          const req = createHttpRequest(EdgeDhcpUrls.deleteDhcpService, params)
          return {
            ...req
          }
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
    }),
    getEdgeDhcp: build.query<EdgeDhcpSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcp, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'DETAIL' }]
    }),
    getEdgeDhcpList: build.query<TableResult<EdgeDhcpSetting>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
    })
  })
})

export const {
  useAddEdgeDhcpServiceMutation,
  useUpdateEdgeDhcpMutation,
  useDeleteEdgeDhcpMutation,
  useGetEdgeDhcpQuery,
  useGetEdgeDhcpListQuery
} = edgeDhcpApi
