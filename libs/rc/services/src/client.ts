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
  endpoints: () => ({ })
})

export const clientApi = baseClientApi.injectEndpoints({
  endpoints: (build) => ({
    getClientList: build.query<TableResult<any>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          CommonUrlsInfo.getClientList,
          params
        )
        return {
          ...req,
          body: payload
        }
      }
    }),
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
      }
    })
  }),
})
export const { 
  useGetClientListQuery,
  useGetGuestsListQuery
} = clientApi
