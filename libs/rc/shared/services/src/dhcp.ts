import {
  WifiUrlsInfo,
  DhcpServiceProfile
} from '@acx-ui/rc/utils'
import { baseDhcpApi }       from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

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
