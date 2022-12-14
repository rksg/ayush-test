import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  EdgeUrlsInfo,
  TableResult,
  EdgeStatus,
  createHttpRequest,
  EdgeGeneralSetting,
  RequestPayload
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
    addEdge: build.mutation<EdgeGeneralSetting, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.addEdge)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }]
    }),
    getEdge: build.query<EdgeGeneralSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdge, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }]
    }),
    updateEdge: build.mutation<EdgeGeneralSetting, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateEdge, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }]
    }),
    getEdgeList: build.query<TableResult<EdgeStatus>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'LIST' }]
    }),
    deleteEdge: build.mutation<string, RequestPayload>({
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
    sendOtp: build.mutation<string, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.sendOtp, params)
        return {
          ...req,
          body: { otpState: 'RENEW' }
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }]
    }),
    edgeBySerialNumber: build.query<EdgeStatus, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeList, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: TableResult<EdgeStatus>) {
        return transformEdgeStatus(result?.data[0])
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
  useEdgeBySerialNumberQuery
} = edgeApi

const transformEdgeStatus = (result: EdgeStatus) => {
  const edge = JSON.parse(JSON.stringify(result))

  return edge
}