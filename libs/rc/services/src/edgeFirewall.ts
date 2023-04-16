import {
  CommonResult,
  EdgeFirewallUrls,
  EdgeFirewallViewData,
  RequestPayload,
  TableResult
} from '@acx-ui/rc/utils'
import { baseEdgeFirewallApi } from '@acx-ui/store'
import { createHttpRequest }   from '@acx-ui/utils'

export const edgeFirewallApi = baseEdgeFirewallApi.injectEndpoints({
  endpoints: (build) => ({
    getEdgeFirewallViewDataList: build.query<TableResult<EdgeFirewallViewData>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeFirewallUrls.getEdgeFirewallViewDataList)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeFirewall', id: 'LIST' }]
      // async onCacheEntryAdded (requestArgs, api) {
      //   await onSocketActivityChanged(requestArgs, api, (msg) => {
      //     const activities = [
      //       'AddTunnelServiceProfile',
      //       'UpdateTunnelServiceProfile',
      //       'DeleteTunnelServiceProfile'
      //     ]
      //     onActivityMessageReceived(msg, activities, () => {
      //       api.dispatch(
      //         tunnelProfileApi.util.invalidateTags([
      //           { type: 'TunnelProfile', id: 'LIST' }
      //         ])
      //       )
      //     })
      //   })
      // }
    }),
    deleteEdgeFirewall: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        if(payload){ //delete multiple rows
          const req = createHttpRequest(EdgeFirewallUrls.batchDeleteEdgeFirewall)
          return {
            ...req,
            body: payload
          }
        }else{ //delete single row
          const req = createHttpRequest(EdgeFirewallUrls.deleteEdgeFirewall, params)
          return {
            ...req
          }
        }
      },
      invalidatesTags: [{ type: 'EdgeFirewall', id: 'LIST' }]
    })
  })
})

export const {
  useGetEdgeFirewallViewDataListQuery,
  useDeleteEdgeFirewallMutation
} = edgeFirewallApi