import { CommonResult, RequestPayload, TableResult, TunnelProfileUrls, TunnelProfileViewData } from '@acx-ui/rc/utils'
import { baseTunnelProfileApi }                                                                from '@acx-ui/store'
import { createHttpRequest }                                                                   from '@acx-ui/utils'

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
    getTunnelProfileViewDataList: build.query<TableResult<TunnelProfileViewData>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(TunnelProfileUrls.getTunnelProfileViewDataList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'TunnelProfile', id: 'LIST' }]
    }),
    deleteTunnelProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        if(payload){ //delete multiple rows
          const req = createHttpRequest(TunnelProfileUrls.batchDeleteTunnelProfile)
          return {
            ...req,
            body: payload
          }
        }else{ //delete single row
          const req = createHttpRequest(TunnelProfileUrls.deleteTunnelProfile, params)
          return {
            ...req
          }
        }
      },
      invalidatesTags: [{ type: 'TunnelProfile', id: 'LIST' }]
    })
  })
})

export const {
  useCreateTunnelProfileMutation,
  useGetTunnelProfileViewDataListQuery,
  useDeleteTunnelProfileMutation
} = tunnelProfileApi