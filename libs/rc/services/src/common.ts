import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  RequestPayload,
  onSocketActivityChanged,
  showActivityToast
} from '@acx-ui/rc/utils'


export const baseCommonApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'commonApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const commonApi = baseCommonApi.injectEndpoints({
  endpoints: (build) => ({
    streamActivityMessages: build.query<unknown[], RequestPayload>({
      // This query is for global websocket event and it shows activity messages.
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityToast(msg)
        })
      }
    })
  })
})

export const {
  useStreamActivityMessagesQuery
} = commonApi
