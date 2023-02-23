import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload
} from '@acx-ui/rc/utils'

export const baseRbacApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'rbacApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const rbacApi = baseRbacApi.injectEndpoints({
  endpoints: (build) => ({
    wifiAllowedOperations: build.query<string[], RequestPayload>({
      query: ({ params }) => {
        const wifiAllowedOpsInfo = createHttpRequest(
          CommonUrlsInfo.wifiAllowedOperations,
          params
        )
        return {
          ...wifiAllowedOpsInfo
        }
      }
    }),
    switchAllowedOperations: build.query<string[], RequestPayload>({
      query: ({ params }) => {
        const switchAllowedOpsInfo = createHttpRequest(
          CommonUrlsInfo.switchAllowedOperations,
          params
        )
        return {
          ...switchAllowedOpsInfo
        }
      }
    }),
    tenantAllowedOperations: build.query<string[], RequestPayload>({
      query: ({ params }) => {
        const tenantAllowedOpsInfo = createHttpRequest(
          CommonUrlsInfo.tenantAllowedOperations,
          params
        )
        return {
          ...tenantAllowedOpsInfo
        }
      }
    }),
    venueAllowedOperations: build.query<string[], RequestPayload>({
      query: ({ params }) => {
        const venueAllowedOpsInfo = createHttpRequest(
          CommonUrlsInfo.venueAllowedOperations,
          params
        )
        return {
          ...venueAllowedOpsInfo
        }
      }
    }),
    guestAllowedOperations: build.query<string[], RequestPayload>({
      query: ({ params }) => {
        const guestAllowedOpsInfo = createHttpRequest(
          CommonUrlsInfo.guestAllowedOperations,
          params
        )
        return {
          ...guestAllowedOpsInfo
        }
      }
    }),
    upgradeAllowedOperations: build.query<string[], RequestPayload>({
      query: ({ params }) => {
        const upgradeAllowedOpsInfo = createHttpRequest(
          CommonUrlsInfo.upgradeAllowedOperations,
          params
        )
        return {
          ...upgradeAllowedOpsInfo
        }
      }
    })
  })
})
export const {
  useWifiAllowedOperationsQuery,
  useSwitchAllowedOperationsQuery,
  useTenantAllowedOperationsQuery,
  useVenueAllowedOperationsQuery,
  useGuestAllowedOperationsQuery,
  useUpgradeAllowedOperationsQuery
} = rbacApi
