import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  WifiUrlsInfo,
  createHttpRequest,
  RequestPayload,
  DhcpServiceProfile
} from '@acx-ui/rc/utils'

export const baseDhcpApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'dhcpApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const dhcpApi = baseDhcpApi.injectEndpoints({
  endpoints: (build) => ({
    getDefaultGuestDhcpServiceProfile: build.query<DhcpServiceProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          WifiUrlsInfo.GetDefaultDhcpServiceProfileForGuestNetwork,
          params
        )
        return {
          ...req
        }
      }
    })
  })
})
export const { useGetDefaultGuestDhcpServiceProfileQuery } = dhcpApi
