import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  createHttpRequest,
  RequestPayload,
  SwitchUrlsInfo,
  SwitchViewModel
} from '@acx-ui/rc/utils'

export const baseSwitchApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'switchApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const switchApi = baseSwitchApi.injectEndpoints({
  endpoints: (build) => ({
    switchDetailHeader: build.query<SwitchViewModel, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchDetailHeader, params)
        return {
          ...req
        }
      }
    })
  })
})
export const { useSwitchDetailHeaderQuery } = switchApi
