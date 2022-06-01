import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { CommonUrlsInfo, createHttpRequest } from '@acx-ui/rc/utils'

import { RequestPayload } from './types'

export const baseCloudpathApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'cloudpathApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const cloudpathApi = baseCloudpathApi.injectEndpoints({
  endpoints: (build) => ({
    cloudpathList: build.query<any, RequestPayload>({
      query: ({ params }) => {
        const cloudpathListReq = createHttpRequest(
          CommonUrlsInfo.getCloudpathList,
          params
        )
        return {
          ...cloudpathListReq
        }
      }
    })
  })
})

export const { useCloudpathListQuery } = cloudpathApi
