import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  Guest,
  RequestPayload,
  TableResult
} from '@acx-ui/rc/utils'

export const baseClientApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'clientApi',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Client', 'Guest'],
  endpoints: () => ({ })
})

export const clientApi = baseClientApi.injectEndpoints({
  endpoints: (build) => ({
    getGuestsList: build.query<TableResult<Guest>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          CommonUrlsInfo.getGuestsList,
          params
        )
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Guest', id: 'LIST' }]
    })
  })
})
export const {
  useGetGuestsListQuery
} = clientApi
