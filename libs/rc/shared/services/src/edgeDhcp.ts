import {
  CommonResult,
  DhcpHostStats,
  DhcpPoolStats,
  DhcpStats,
  DhcpUeSummaryStats,
  EdgeDhcpSetting,
  EdgeDhcpUrls,
  EdgeServiceCompatibilitiesResponse,
  EdgeServiceCompatibilitiesResponseV1_1,
  onActivityMessageReceived,
  onSocketActivityChanged,
  TableResult
} from '@acx-ui/rc/utils'
import { baseEdgeDhcpApi }                 from '@acx-ui/store'
import { RequestPayload }                  from '@acx-ui/types'
import { createHttpRequest, showApiError } from '@acx-ui/utils'

import { edgeApi } from './edge'

const versionHeader = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}

enum EdgeDhcpActivityEnum {
  CREATE = 'Create Dhcp',
  UPDATE = 'Update Dhcp',
  DELETE = 'Delete Dhcp',
  ACTIVATE = 'Activate Dhcp',
  DEACTIVATE = 'Deactivate Dhcp',
  RESTART = 'Restart Dhcp'
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
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            EdgeDhcpActivityEnum.UPDATE
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeDhcpApi.util.invalidateTags([{ type: 'EdgeDhcp', id: 'DETAIL' }]))
          })
        })
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
            EdgeDhcpActivityEnum.UPDATE
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
            EdgeDhcpActivityEnum.CREATE,
            EdgeDhcpActivityEnum.UPDATE,
            EdgeDhcpActivityEnum.DELETE,
            EdgeDhcpActivityEnum.ACTIVATE,
            EdgeDhcpActivityEnum.DEACTIVATE
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
    }),
    getDhcpEdgeCompatibilities: build.query<EdgeServiceCompatibilitiesResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpEdgeCompatibilities, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'COMPATIBILITY' }]
    }),
    // eslint-disable-next-line max-len
    getDhcpEdgeCompatibilitiesV1_1: build.query<EdgeServiceCompatibilitiesResponseV1_1, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpEdgeCompatibilitiesV1_1, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'COMPATIBILITY' }]
    })
  })
})

export const {
  useAddEdgeDhcpServiceMutation,
  useUpdateEdgeDhcpServiceMutation,
  usePatchEdgeDhcpServiceMutation,
  useDeleteEdgeDhcpServicesMutation,
  useGetEdgeDhcpServiceQuery,
  useLazyGetEdgeDhcpServiceQuery,
  useGetDhcpPoolStatsQuery,
  useGetDhcpStatsQuery,
  useGetDhcpHostStatsQuery,
  useGetDhcpUeSummaryStatsQuery,
  useActivateEdgeDhcpServiceMutation,
  useDeactivateEdgeDhcpServiceMutation,
  useRestartEdgeDhcpServiceMutation,
  useGetDhcpEdgeCompatibilitiesQuery,
  useLazyGetDhcpEdgeCompatibilitiesQuery,
  useGetDhcpEdgeCompatibilitiesV1_1Query,
  useLazyGetDhcpEdgeCompatibilitiesV1_1Query
} = edgeDhcpApi
