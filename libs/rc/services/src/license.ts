import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  LicenseUrlsInfo,
  Entitlement,
  EntitlementBanner,
  createHttpRequest,
  RequestPayload
} from '@acx-ui/rc/utils'

export const baseLicenseApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'licenseApi',
  tagTypes: ['License'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const licenseApi = baseLicenseApi.injectEndpoints({
  endpoints: (build) => ({
    entitlementList: build.query<Entitlement[], RequestPayload>({
      query: ({ params }) => {
        const entitlementListReq =
          createHttpRequest(LicenseUrlsInfo.getEntitlements, params)
        return {
          ...entitlementListReq
        }
      },
      providesTags: [{ type: 'License', id: 'LIST' }]
    }),
    entitlementBanners: build.query<EntitlementBanner[], RequestPayload>({
      query: ({ params }) => {
        const EntitlementBannerReq =
          createHttpRequest(LicenseUrlsInfo.getEntitlementsBanners, params)
        return {
          ...EntitlementBannerReq
        }
      },
      providesTags: [{ type: 'License', id: 'BANNERS' }]
    })
  })
})
export const {
  useEntitlementListQuery,
  useEntitlementBannersQuery
} = licenseApi
