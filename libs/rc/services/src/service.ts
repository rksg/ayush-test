import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload,
  TableResult,
  CommonResult,
  Service
} from '@acx-ui/rc/utils'

export const baseServiceApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'serviceApi',
  tagTypes: ['Service'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const serviceApi = baseServiceApi.injectEndpoints({
  endpoints: (build) => ({
    serviceList: build.query<TableResult<Service>, RequestPayload>({
      query: ({ params, payload }) => {
        const serviceListReq = createHttpRequest(CommonUrlsInfo.getServicesList, params)
        return {
          ...serviceListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    deleteService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.deleteService, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    })
  })
})
export const {
  useServiceListQuery,
  useDeleteServiceMutation
} = serviceApi
