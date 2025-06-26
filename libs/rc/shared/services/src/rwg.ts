import { isArray } from 'lodash'

import {
  onSocketActivityChanged,
  onActivityMessageReceived,
  RWG,
  GatewayAlarms,
  GatewayDashboard,
  GatewayTopProcess,
  GatewayFileSystem,
  GatewayDetails,
  CommonRbacUrlsInfo,
  RWGRow,
  RWGClusterNode
} from '@acx-ui/rc/utils'
import { baseRWGApi }                  from '@acx-ui/store'
import { RequestPayload }              from '@acx-ui/types'
import { TableResult, batchApi, createHttpRequest } from '@acx-ui/utils'

export const rwgApi = baseRWGApi.injectEndpoints({
  endpoints: (build) => ({
    rwgList: build.query<TableResult<RWGRow>, RequestPayload>({
      query: ({ params, payload }) => {
        const rwgListReq = createHttpRequest(
          params?.venueId
            ? CommonRbacUrlsInfo.getRwgListByVenueId
            : CommonRbacUrlsInfo.getRwgList, params)
        return {
          ...rwgListReq,
          body: payload
        }
      },
      transformResponse: ({ response }) => {

        const _res: RWGRow[] = response.data.map((rwg: RWG) => rwg.isCluster ? {
          ...rwg,
          ip: rwg.hostname,
          rowId: rwg.rwgId,
          children: rwg.clusterNodes?.map((node: RWGClusterNode) => {
            return {
              ip: node.ip,
              name: node.name,
              clusterName: rwg.name,
              rwgId: node.id,
              rowId: rwg.rwgId + '_' + node.id,
              clusterId: rwg.rwgId,
              status: rwg.status,
              venueName: rwg.venueName,
              venueId: rwg.venueId,
              hostname: rwg.hostname + ' / ' + node.ip,
              isNode: true } as RWGRow
          })
        } : { ...rwg, rwgId: rwg.rwgId, rowId: rwg.rwgId })
        return {
          data: _res,
          totalCount: response.totalCount,
          page: response.page
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'RWG', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddGateway',
            'DeleteGateway',
            'UpdateGateway'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(rwgApi.util.invalidateTags([{ type: 'RWG', id: 'LIST' }]))
          })
        })
      }
    }),
    getRwg: build.query<RWG, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonRbacUrlsInfo.getGateway, params)
        return{
          ...req
        }
      },
      transformResponse: (data: { response: RWG }) => {
        return data?.response
      },
      providesTags: [{ type: 'RWG', id: 'DETAIL' }]
    }),
    batchDeleteGateway: build.mutation<RWG, RequestPayload[]>({
      async queryFn (requests, _queryApi, _extraOptions, fetchWithBQ) {
        return batchApi(CommonRbacUrlsInfo.deleteGateway, requests, fetchWithBQ)
      },
      invalidatesTags: [{ type: 'RWG', id: 'LIST' }]
    }),
    addGateway: build.mutation<RWG, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonRbacUrlsInfo.addGateway, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RWG', id: 'LIST' }]
    }),
    updateGateway: build.mutation<RWG, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonRbacUrlsInfo.updateGateway, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RWG', id: 'LIST' }]
    }),
    getGatewayAlarms: build.query<GatewayAlarms, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonRbacUrlsInfo.getGatewayAlarms, params)
        return{
          ...req,
          body: payload
        }
      },
      transformResponse: (data: { response: GatewayAlarms }) => {
        return data?.response || {}
      },
      providesTags: [{ type: 'RWG', id: 'DETAIL' }]
    }),
    getGatewayDashboard: build.query<GatewayDashboard, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          params?.clusterNodeId
            ? CommonRbacUrlsInfo.getClusterGatewayDashboard
            : CommonRbacUrlsInfo.getGatewayDashboard,
          params)
        return{
          ...req
        }
      },
      transformResponse: (data: { response: GatewayDashboard | GatewayDashboard[] }) => {
        return isArray(data?.response)
          ? data?.response[0] || {}
          : data?.response || {}
      },
      providesTags: [{ type: 'RWG', id: 'DETAIL' }]
    }),
    getGatewayTopProcess: build.query<GatewayTopProcess[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          params?.clusterNodeId
            ? CommonRbacUrlsInfo.getClusterGatewayTopProcess
            : CommonRbacUrlsInfo.getGatewayTopProcess
          , params)
        return{
          ...req
        }
      },
      transformResponse: (data: { response: GatewayTopProcess[] }) => {
        return data?.response || {}
      },
      providesTags: [{ type: 'RWG', id: 'DETAIL' }]
    }),
    getGatewayFileSystems: build.query<GatewayFileSystem[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          params?.clusterNodeId
            ? CommonRbacUrlsInfo.getClusterGatewayFileSystems
            : CommonRbacUrlsInfo.getGatewayFileSystems,
          params)
        return{
          ...req
        }
      },
      transformResponse: (data: { response: GatewayFileSystem[] }) => {
        return data?.response
      },
      providesTags: [{ type: 'RWG', id: 'DETAIL' }]
    }),
    getGatewayDetails: build.query<GatewayDetails, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          params?.clusterNodeId
            ? CommonRbacUrlsInfo.getClusterGatewayDetails
            : CommonRbacUrlsInfo.getGatewayDetails, params)
        return{
          ...req
        }
      },
      transformResponse: (data: { response: GatewayDetails | GatewayDetails[] }) => {
        return isArray(data?.response)
          ? data?.response[0] || {}
          : data?.response || {}
      },
      providesTags: [{ type: 'RWG', id: 'DETAIL' }]
    }),
    refreshRwg: build.mutation<void, void>({
      queryFn: async () => {
        return { data: undefined }
      },
      invalidatesTags: [{ type: 'RWG', id: 'DETAIL' }]
    })
  })
})

export const {
  useRwgListQuery,
  useLazyRwgListQuery,
  useGetRwgQuery,
  useBatchDeleteGatewayMutation,
  useAddGatewayMutation,
  useUpdateGatewayMutation,
  useGetGatewayAlarmsQuery,
  useGetGatewayDashboardQuery,
  useGetGatewayTopProcessQuery,
  useGetGatewayFileSystemsQuery,
  useGetGatewayDetailsQuery,
  useRefreshRwgMutation
} = rwgApi
