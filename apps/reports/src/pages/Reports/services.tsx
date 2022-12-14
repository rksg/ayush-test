import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { createHttpRequest, RequestPayload } from '@acx-ui/rc/utils'

export const reportsBaseApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'reportsApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export interface GuestToken {
  token: string
}

export interface DashboardMetadata {
  result: {
    uuid: string,
    dashboard_id: string,
    allowed_domains: string[]
  }
}

const getEmbeddedReportToken = {
  method: 'post',
  url: '/api/a4rc/explorer/api/v1/security/guest_token'
}

const getEmbeddedDashboardMeta = {
  method: 'post',
  url: '/api/a4rc/explorer/api/v1/dashboard/embedded'
}

const reportsApi = reportsBaseApi.injectEndpoints({
  endpoints: (build) => ({
    guestToken: build.mutation<string, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(getEmbeddedReportToken, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (response : GuestToken) =>{
        return response.token
      }
    }),
    embeddedId: build.mutation<string, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(getEmbeddedDashboardMeta, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (response : DashboardMetadata) =>{
        return response.result.uuid
      }
    })
  })
})

export const { useGuestTokenMutation, useEmbeddedIdMutation } = reportsApi
