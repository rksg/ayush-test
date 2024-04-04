import {
  LicenseUrlsInfo,
  Entitlement,
  EntitlementBanner,
  EntitlementActivations
} from '@acx-ui/rc/utils'
import { baseLicenseApi }    from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

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
    }),
    entitlementActivationss: build.query<EntitlementActivations[], RequestPayload>({
      query: ({ params, payload }) => {
        const EntitlementActivationReq =
          createHttpRequest(LicenseUrlsInfo.getEntitlementsActivations, params)
        return {
          ...EntitlementActivationReq,
          body: payload
        }
      },
      providesTags: [{ type: 'License', id: 'ACTIVATIONS' }]
    })
  })
})

export const {
  useEntitlementListQuery,
  useEntitlementBannersQuery,
  useEntitlementActivationssQuery
} = licenseApi
