import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload
} from '@acx-ui/rc/utils'

import { CloudpathServer } from './types'

export const baseCloudpathApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'cloudpathApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const cloudpathApi = baseCloudpathApi.injectEndpoints({
  endpoints: (build) => ({
    cloudpathList: build.query<CloudpathServer[], RequestPayload>({
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
