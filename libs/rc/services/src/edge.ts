import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { createHttpRequest, EdgeUrlsInfo, RequestPayload, TableResult, EdgeViewModel } from '@acx-ui/rc/utils'

export const baseEdgeApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'edgeApi',
  tagTypes: ['Edge'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const edgeApi = baseEdgeApi.injectEndpoints({
  endpoints: (build) => ({
    getEdgeList: build.query<TableResult<EdgeViewModel>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeList)
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
    })
  })
})

export const {
  useGetEdgeListQuery,
  useLazyGetEdgeListQuery,
  useDeleteEdgeMutation
} = edgeApi
