/* eslint-disable max-len */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonResult,
  createHttpRequest, NetworkSegmentationGroupStats, NetworkSegmentationUrls, RequestPayload, TableResult
} from '@acx-ui/rc/utils'

export const baseNsgApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'nsgApi',
  tagTypes: ['Networksegmentation'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const nsgApi = baseNsgApi.injectEndpoints({
  endpoints: (build) => ({
    createNetworkSegmentationGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.createNetworkSegmentationGroup)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Networksegmentation', id: 'LIST' }]
    }),
    getNetworkSegmentationStatsList: build.query<TableResult<NetworkSegmentationGroupStats>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.getNetworkSegmentationStatsList)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Networksegmentation', id: 'LIST' }]
    }),
    deleteNetworkSegmentationGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.deleteNetworkSegmentationGroup, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Networksegmentation', id: 'LIST' }]
    })
  })
})

export const {
  useCreateNetworkSegmentationGroupMutation,
  useGetNetworkSegmentationStatsListQuery,
  useDeleteNetworkSegmentationGroupMutation
} = nsgApi