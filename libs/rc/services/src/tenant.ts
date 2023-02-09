import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  // TableResult,
  // CommonResult,
  createHttpRequest,
  RequestPayload,
  AdministrationUrlsInfo,
  TenantDetails
} from '@acx-ui/rc/utils'

export const baseTenantApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'tenantApi',
  tagTypes: ['Tenant'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const tenantApi = baseTenantApi.injectEndpoints({
  endpoints: (build) => ({
    getTenantDetails: build.query<TenantDetails, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getTenantDetails, params)
        return {
          ...req
        }
      }
    })
  })
})

export const {
  useGetTenantDetailsQuery
} = tenantApi
