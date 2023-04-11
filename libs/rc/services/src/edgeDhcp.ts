import {
  CommonResult,
  createHttpRequest,
  DhcpHostStats,
  DhcpPoolStats,
  DhcpStats,
  EdgeDhcpSetting,
  EdgeDhcpUrls,
  PaginationQueryResult,
  RequestPayload,
  TableResult
} from '@acx-ui/rc/utils'
import { baseEdgeDhcpApi } from '@acx-ui/store'

export const edgeDhcpApi = baseEdgeDhcpApi.injectEndpoints({
  endpoints: (build) => ({
    addEdgeDhcpService: build.mutation<EdgeDhcpSetting, RequestPayload>({
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
      },
      invalidatesTags: [{ type: 'EdgeDhcp', id: 'LIST' }, { type: 'EdgeDhcp', id: 'DETAIL' }]
    }),
    deleteEdgeDhcpServices: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        if(payload){ //delete multiple rows
          const req = createHttpRequest(EdgeDhcpUrls.bulkDeleteDhcpServices)
          return {
            ...req,
            body: payload
          }
        }else{ //delete single row
          const req = createHttpRequest(EdgeDhcpUrls.deleteDhcpService, params)
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
      providesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
    }),
    getDhcpByEdgeId: build.query<EdgeDhcpSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpByEdgeId, params)
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
      providesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
    }),
    getDhcpStats: build.query<TableResult<DhcpStats>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeDhcpUrls.getDhcpStats, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeDhcp', id: 'LIST' }]
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
  useGetDhcpHostStatsQuery
} = edgeDhcpApi
