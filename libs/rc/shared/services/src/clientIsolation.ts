import {
  ApiVersionEnum,
  ClientIsolationUrls,
  CommonResult,
  GetApiVersionHeader
} from '@acx-ui/rc/utils'
import { baseClientIsolationApi } from '@acx-ui/store'
import { RequestPayload }         from '@acx-ui/types'
import { createHttpRequest }      from '@acx-ui/utils'
export const clientIsolationApi = baseClientIsolationApi.injectEndpoints({
  endpoints: (build) => ({
    activateClientIsolationOnVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          ClientIsolationUrls.activateClientIsolationOnVenue, params, customHeaders
        )
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'ClientIsolation', id: 'LIST' }]
    }),
    deleteClientIsolationOnVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          ClientIsolationUrls.deactivateClientIsolationOnVenue, params, customHeaders
        )
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'ClientIsolation', id: 'LIST' }]
    }),
    activateClientIsolationOnAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          ClientIsolationUrls.activateClientIsolationOnAp, params, customHeaders
        )
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'ClientIsolation', id: 'LIST' }]
    }),
    deactivateClientIsolationOnAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          ClientIsolationUrls.deactivateClientIsolationOnAp, params, customHeaders
        )
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'ClientIsolation', id: 'LIST' }]
    })
  })
})

export const {
  useActivateClientIsolationOnVenueMutation,
  useDeleteClientIsolationOnVenueMutation,
  useActivateClientIsolationOnApMutation,
  useDeactivateClientIsolationOnApMutation
} = clientIsolationApi
