import {
  CommonUrlsInfo,
  onSocketActivityChanged,
  onActivityMessageReceived,
  TableResult,
  RWG,
  GatewayAlarms,
  GatewayDashboard,
  GatewayTopProcess,
  GatewayFileSystem,
  GatewayDetails,
  CommonRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { baseRWGApi }                  from '@acx-ui/store'
import { RequestPayload }              from '@acx-ui/types'
import { batchApi, createHttpRequest } from '@acx-ui/utils'

export const rwgApi = baseRWGApi.injectEndpoints({
  endpoints: (build) => ({
    rwgList: build.query<TableResult<RWG>, RequestPayload>({
      query: ({ params, payload }) => {
        const rwgListReq = createHttpRequest(CommonUrlsInfo.getRwgList, params)
        return {
          ...rwgListReq,
          body: payload
        }
      },
      transformResponse: ({ response }) => {
        return {
          data: response.items,
          totalCount: response.totalSizes,
          page: response.totalPages
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
        const req = createHttpRequest(CommonUrlsInfo.getGateway, params)
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
        const req = createHttpRequest(CommonUrlsInfo.addGateway, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RWG', id: 'LIST' }]
    }),
    updateGateway: build.mutation<RWG, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateGateway, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RWG', id: 'LIST' }]
    }),
    getGatewayAlarms: build.query<GatewayAlarms, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getGatewayAlarms, params)
        return{
          ...req
        }
      },
      transformResponse: (data: { response: GatewayAlarms }) => {
        return data?.response || {}
      },
      providesTags: [{ type: 'RWG', id: 'DETAIL' }]
    }),
    getGatewayDashboard: build.query<GatewayDashboard, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getGatewayDashboard, params)
        return{
          ...req
        }
      },
      transformResponse: (data: { response: GatewayDashboard }) => {
        return data?.response || {}
      },
      providesTags: [{ type: 'RWG', id: 'DETAIL' }]
    }),
    getGatewayTopProcess: build.query<GatewayTopProcess[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getGatewayTopProcess, params)
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
        const req = createHttpRequest(CommonUrlsInfo.getGatewayFileSystems, params)
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
        const req = createHttpRequest(CommonUrlsInfo.getGatewayDetails, params)
        return{
          ...req
        }
      },
      transformResponse: (data: { response: GatewayDetails }) => {
        return data?.response
      },
      providesTags: [{ type: 'RWG', id: 'DETAIL' }]
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
  useGetGatewayDetailsQuery
} = rwgApi
