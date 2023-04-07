import { CommonResult, RequestPayload, TunnelProfile, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { baseTunnelProfileApi }                                           from '@acx-ui/store'
import { createHttpRequest }                                              from '@acx-ui/utils'

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
    }),
    getTunnelProfile: build.query<TunnelProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(TunnelProfileUrls.getTunnelProfile, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'TunnelProfile', id: 'DETAIL' }]
    }),
    updateTunnelProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(TunnelProfileUrls.updateTunnelProfile, params)
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
  useCreateTunnelProfileMutation,
  useGetTunnelProfileQuery,
  useUpdateTunnelProfileMutation
} = tunnelProfileApi