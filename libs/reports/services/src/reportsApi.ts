
import {
  reportsApi as reportsBaseApi,
  REPORT_BASE_RELATIVE_URL as BASE_RELATIVE_URL } from '@acx-ui/store'
import { RequestPayload }             from '@acx-ui/types'
import { ApiInfo, createHttpRequest } from '@acx-ui/utils'


export interface GuestToken {
  token: string
}
export interface UrlInfo {
  redirect_url: string
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
  },
  authenticate: {
    method: 'post',
    url: `${BASE_RELATIVE_URL}/authenticate/?locale=:locale`
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
    }),
    authenticate: build.mutation<string, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ReportUrlsInfo.authenticate, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (response : UrlInfo) => {
        return response.redirect_url
      }
    })
  })
})

export const { useGuestTokenMutation, useEmbeddedIdMutation, useAuthenticateMutation } = reportsApi
