import {
  createHttpRequest,
  RequestPayload,
  TableResult,
  CommonResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  NewAPITableResult,
  transferNewResToTableResult,
  EdgeFirewallUrls,
  EdgeFirewallSetting,
  EdgeFirewallViewData
} from '@acx-ui/rc/utils'
import { baseEdgeFirewallApi } from '@acx-ui/store'

import { serviceApi } from './service'

export const edgeFirewallApi = baseEdgeFirewallApi.injectEndpoints({
  endpoints: (build) => ({
    getEdgeFirewallList: build.query<TableResult<EdgeFirewallSetting>, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeFirewallUrls.getEdgeFirewallList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeFirewall', id: 'LIST' }],
      transformResponse: (result: NewAPITableResult<EdgeFirewallSetting>) => {
        return transferNewResToTableResult<EdgeFirewallSetting>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Add Firewall',
            'Update Firewall',
            'Delete Firewall'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' }
            ]))
            api.dispatch(edgeFirewallApi.util.invalidateTags([
              { type: 'EdgeFirewall', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getEdgeFirewall: build.query<EdgeFirewallSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeFirewallUrls.getEdgeFirewall, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeFirewall', id: 'DETAIL' }]
    }),
    addEdgeFirewall: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeFirewallUrls.addEdgeFirewall, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeFirewall', id: 'LIST' }]
    }),
    updateEdgeFirewall: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeFirewallUrls.updateEdgeFirewall, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeFirewall', id: 'LIST' }]
    }),
    getEdgeFirewallViewDataList: build.query<TableResult<EdgeFirewallViewData>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeFirewallUrls.getEdgeFirewallViewDataList)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeFirewall', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Add Firewall',
            'Update Firewall',
            'Delete Firewall'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' }
            ]))
            api.dispatch(edgeFirewallApi.util.invalidateTags([
              { type: 'EdgeFirewall', id: 'LIST' }
            ]))
          })
        })
      }
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
  useAddEdgeFirewallMutation,
  useUpdateEdgeFirewallMutation,
  useGetEdgeFirewallListQuery,
  useGetEdgeFirewallQuery,
  useGetEdgeFirewallViewDataListQuery,
  useDeleteEdgeFirewallMutation
} = edgeFirewallApi
