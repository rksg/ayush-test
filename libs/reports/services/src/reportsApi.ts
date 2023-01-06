import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { ApiInfo, createHttpRequest, RequestPayload } from '@acx-ui/rc/utils'

export const BASE_RELATIVE_URL = '/api/a4rc/explorer'

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

export const ReportUrlsInfo: { [key: string]: ApiInfo } = {
  getEmbeddedReportToken: {
    method: 'post',
    url: `${BASE_RELATIVE_URL}/api/v1/security/guest_token/`
    // Comment above and enable this proxy for superset local dev (docker-compose) setup
    // url: '/api/v1/security/guest_token/'
  },
  getEmbeddedDashboardMeta: {
    method: 'post',
    url: `${BASE_RELATIVE_URL}/api/v1/dashboard/embedded`
    // Comment above and enable this proxy for superset local dev (docker-compose) setup
    // url: '/api/v1/dashboard/embedded'
  }
}

export const reportsApi = reportsBaseApi.injectEndpoints({
  endpoints: (build) => ({
    guestToken: build.mutation<string, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ReportUrlsInfo.getEmbeddedReportToken, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (response : GuestToken) => {
        return response.token
      }
    }),
    embeddedId: build.mutation<string, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ReportUrlsInfo.getEmbeddedDashboardMeta, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (response : DashboardMetadata) => {
        return response.result.uuid
      }
    })
  })
})

export const { useGuestTokenMutation, useEmbeddedIdMutation } = reportsApi
