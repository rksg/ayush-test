import {
  CommonResult,
  DhcpHostStats,
  DhcpPoolStats,
  DhcpStats,
  DhcpUeSummaryStats,
  EdgeDhcpSetting,
  EdgeDhcpUrls,
  onActivityMessageReceived,
  onSocketActivityChanged,
  PaginationQueryResult,
  TableResult
} from '@acx-ui/rc/utils'
import { baseEdgeDhcpApi }                                   from '@acx-ui/store'
import { RequestPayload }                                    from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal, showApiError } from '@acx-ui/utils'

import { edgeApi } from './edge'

const versionHeader = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}

export const edgeDhcpApi = baseEdgeDhcpApi.injectEndpoints({
  endpoints: (build) => ({
    addEdgeDhcpService: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeDhcpUrls.addDhcpService, undefined, versionHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
    }),
    updateEdgeDhcpService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeDhcpUrls.updateDhcpService, params, versionHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }, { type: 'EdgeDhcp', id: 'DETAIL' }]
    }),
    patchEdgeDhcpService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeDhcpUrls.patchDhcpService, params, versionHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
      // If get data before the viewmodel has been written, it will get the wrong data.
      // invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }, { type: 'EdgeDhcp', id: 'DETAIL' }]
    }),
    deleteEdgeDhcpServices: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.deleteDhcpService, params, {
          ...versionHeader,
          ...showApiError
        })
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
    }),
    getEdgeDhcpService: build.query<EdgeDhcpSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcp, params, versionHeader)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'DETAIL' }]
    }),
    getEdgeDhcpList: build.query<PaginationQueryResult<EdgeDhcpSetting>, RequestPayload>({
      query: ({ payload, params }) => {
        const { page, pageSize } = payload as { page: number, pageSize: number }
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpList, params)
        return {
          ...req,
          params: { page, pageSize }
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Add DHCP',
            'Update DHCP',
            'Delete DHCP'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeDhcpApi.util.invalidateTags([{ type: 'EdgeDhcp', id: 'LIST' }]))
          })
        })
      }
    }),
    getDhcpByEdgeId: build.query<EdgeDhcpSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpByEdgeId, params, {
          ...ignoreErrorModal
        })
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'DETAIL' }]
    }),
    getDhcpPoolStats: build.query<TableResult<DhcpPoolStats>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpPoolStats, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update DHCP'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeDhcpApi.util.invalidateTags([{ type: 'EdgeDhcp', id: 'LIST' }]))
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'SERVICE' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getDhcpStats: build.query<TableResult<DhcpStats>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpStats, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Add DHCP',
            'Update DHCP',
            'Delete DHCP'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeDhcpApi.util.invalidateTags([{ type: 'EdgeDhcp', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getDhcpHostStats: build.query<TableResult<DhcpHostStats>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpHostStats, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getDhcpUeSummaryStats: build.query<TableResult<DhcpUeSummaryStats>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpUeSummaryStats, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
    }),
    restartEdgeDhcpService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.restartDhcpService, params, versionHeader)
        return {
          ...req,
          body: JSON.stringify({ action: 'RESTART_NOW' })
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }, { type: 'EdgeDhcp', id: 'DETAIL' }]
    }),
    activateEdgeDhcpService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.activateDhcpService, params, versionHeader)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }, { type: 'EdgeDhcp', id: 'DETAIL' }]
    }),
    deactivateEdgeDhcpService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.deactivateDhcpService, params, versionHeader)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }, { type: 'EdgeDhcp', id: 'DETAIL' }]
    })
  })
})

export const {
  useAddEdgeDhcpServiceMutation,
  useUpdateEdgeDhcpServiceMutation,
  usePatchEdgeDhcpServiceMutation,
  useDeleteEdgeDhcpServicesMutation,
  useGetEdgeDhcpServiceQuery,
  useGetEdgeDhcpListQuery,
  useGetDhcpByEdgeIdQuery,
  useGetDhcpPoolStatsQuery,
  useGetDhcpStatsQuery,
  useGetDhcpHostStatsQuery,
  useGetDhcpUeSummaryStatsQuery,
  useActivateEdgeDhcpServiceMutation,
  useDeactivateEdgeDhcpServiceMutation,
  useRestartEdgeDhcpServiceMutation
} = edgeDhcpApi
