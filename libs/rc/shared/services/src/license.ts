import {
  LicenseUrlsInfo,
  Entitlement,
  EntitlementBanner,
  EntitlementBannersData,
  onSocketActivityChanged,
  onActivityMessageReceived,
  EntitlementSummaries,
  RbacEntitlementSummary,
  MspEntitlement
} from '@acx-ui/rc/utils'
import { baseLicenseApi }                 from '@acx-ui/store'
import { RequestPayload }                 from '@acx-ui/types'
import { createHttpRequest, TableResult } from '@acx-ui/utils'

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
    getBanners: build.query<EntitlementBannersData, RequestPayload>({
      query: ({ params, payload }) => {
        const req =
        createHttpRequest(LicenseUrlsInfo.getBanners, params, {}, true)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'License', id: 'BANNERS' }]
    }),
    rbacEntitlementSummary: build.query<EntitlementSummaries[], RequestPayload>({
      query: ({ params, payload }) => {
        const mspEntitlementSummaryReq = createHttpRequest(
          LicenseUrlsInfo.getMspEntitlementSummary, params)
        return {
          ...mspEntitlementSummaryReq,
          body: payload
        }
      },
      providesTags: [{ type: 'License', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'MSP license refresh flow'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(licenseApi.util.invalidateTags([{ type: 'License', id: 'LIST' }]))
          })
        })
      },
      transformResponse: (response) => {
        return (response as RbacEntitlementSummary).data
      }
    }),
    rbacEntitlementList: build.query<TableResult<MspEntitlement>, RequestPayload>({
      query: ({ params, payload }) => {
        const mspEntitlementListReq = createHttpRequest(
          LicenseUrlsInfo.getMspEntitlement, params)
        return {
          ...mspEntitlementListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'License', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'MSP license refresh flow'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(licenseApi.util.invalidateTags([{ type: 'License', id: 'LIST' }]))
          })
        })
      }
    })
  })
})

export const {
  useEntitlementListQuery,
  useEntitlementBannersQuery,
  useGetBannersQuery,
  useRbacEntitlementSummaryQuery,
  useRbacEntitlementListQuery
} = licenseApi
