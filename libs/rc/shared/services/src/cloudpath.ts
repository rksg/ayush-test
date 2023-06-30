import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  CloudpathServer
} from '@acx-ui/rc/utils'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

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
