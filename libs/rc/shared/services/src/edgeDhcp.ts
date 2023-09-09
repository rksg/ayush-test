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

export const edgeDhcpApi = baseEdgeDhcpApi.injectEndpoints({
  endpoints: (build) => ({
    addEdgeDhcpService: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeDhcpUrls.addDhcpService)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
    }),
    updateEdgeDhcpService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeDhcpUrls.updateDhcpService, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }, { type: 'EdgeDhcp', id: 'DETAIL' }]
    }),
    patchEdgeDhcpService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeDhcpUrls.patchDhcpService, params)
        return {
          ...req,
          body: payload
        }
      }
      // If get data before the viewmodel has been written, it will get the wrong data.
      // invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }, { type: 'EdgeDhcp', id: 'DETAIL' }]
    }),
    deleteEdgeDhcpServices: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        if(payload){ //delete multiple rows
          const req = createHttpRequest(EdgeDhcpUrls.bulkDeleteDhcpServices, params, {
            ...showApiError
          })
          return {
            ...req,
            body: payload
          }
        }else{ //delete single row
          const req = createHttpRequest(EdgeDhcpUrls.deleteDhcpService, params, {
            ...showApiError
          })
          return {
            ...req
          }
        }
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
    }),
    getEdgeDhcpService: build.query<EdgeDhcpSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcp, params)
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
      }
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
      }
    }),
    getDhcpHostStats: build.query<TableResult<DhcpHostStats>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpHostStats, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
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
  useGetDhcpUeSummaryStatsQuery
} = edgeDhcpApi
