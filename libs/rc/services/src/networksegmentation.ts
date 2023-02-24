import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  createHttpRequest, NetworkSegmentationGroup,
  NetworkSegmentationUrls, RequestPayload
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
    createNetworkSegmentationGroup: build.mutation<NetworkSegmentationGroup, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.createNetworkSegmentationGroup)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Networksegmentation', id: 'LIST' }]
    })
  })
})

export const {
  useCreateNetworkSegmentationGroupMutation
} = nsgApi