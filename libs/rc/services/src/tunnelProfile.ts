import { CommonResult, RequestPayload, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { baseTunnelProfileApi }                            from '@acx-ui/store'
import { createHttpRequest }                               from '@acx-ui/utils'

export const tunnelProfileApi = baseTunnelProfileApi.injectEndpoints({
  endpoints: (build) => ({
    createTunnelProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(TunnelProfileUrls.createTunnelProfile)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'TunnelProfile', id: 'LIST' }]
    })
  })
})

export const {
  useCreateTunnelProfileMutation
} = tunnelProfileApi