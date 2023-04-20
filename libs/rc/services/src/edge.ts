import {
  CommonResult,
  createHttpRequest,
  EdgeDnsServers,
  EdgeGeneralSetting,
  EdgePortConfig,
  EdgeStaticRouteConfig,
  EdgeStatus,
  EdgeSubInterface,
  EdgePortStatus,
  EdgeUrlsInfo,
  PaginationQueryResult,
  RequestPayload,
  TableResult,
  LatestEdgeFirmwareVersion,
  EdgeVenueFirmware,
  EdgeFirmwareVersion,
  onSocketActivityChanged,
  onActivityMessageReceived
} from '@acx-ui/rc/utils'
import { baseEdgeApi } from '@acx-ui/store'

export const edgeApi = baseEdgeApi.injectEndpoints({
  endpoints: (build) => ({
    addEdge: build.mutation<EdgeGeneralSetting, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.addEdge)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }]
    }),
    getEdge: build.query<EdgeGeneralSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdge, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }]
    }),
    updateEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateEdge, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }, { type: 'Edge', id: 'DETAIL' }]
    }),
    getEdgeList: build.query<TableResult<EdgeStatus>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Add Edge',
            'Delete Edges'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'LIST' }]))
          })
        })
      }
    }),
    deleteEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        if(payload){ //delete multiple rows
          const req = createHttpRequest(EdgeUrlsInfo.deleteEdges)
          return {
            ...req,
            body: payload
          }
        }else{ //delete single row
          const req = createHttpRequest(EdgeUrlsInfo.deleteEdge, params)
          return {
            ...req
          }
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }]
    }),
    sendOtp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.sendOtp, params)
        return {
          ...req,
          body: { otpState: 'RENEW' }
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }]
    }),
    edgeBySerialNumber: build.query<EdgeStatus, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeList, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: TableResult<EdgeStatus>) {
        return result.data[0]
      }
    }),
    getDnsServers: build.query<EdgeDnsServers, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getDnsServers, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }, { type: 'Edge', id: 'DNS' }]
    }),
    updateDnsServers: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateDnsServers, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'DNS' }]
    }),
    getPortConfig: build.query<EdgePortConfig, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getPortConfig, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }]
    }),
    updatePortConfig: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updatePortConfig, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    // eslint-disable-next-line max-len
    getSubInterfaces: build.query<TableResult<EdgeSubInterface>, RequestPayload>({
      query: ({ params, payload }) => {
        const { page, pageSize } = payload as { page: number, pageSize: number }
        const req = createHttpRequest(EdgeUrlsInfo.getSubInterfaces, params)
        return {
          ...req,
          params: { page, pageSize }
        }
      },
      transformResponse (response: PaginationQueryResult<EdgeSubInterface>) {
        return {
          data: response.content,
          page: response.page,
          totalCount: response.totalCount
        }
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }, { type: 'Edge', id: 'SUB_INTERFACE' }]
    }),
    addSubInterfaces: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.addSubInterfaces, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'SUB_INTERFACE' }]
    }),
    updateSubInterfaces: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateSubInterfaces, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'SUB_INTERFACE' }]
    }),
    deleteSubInterfaces: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.deleteSubInterfaces, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'SUB_INTERFACE' }]
    }),
    getStaticRoutes: build.query<EdgeStaticRouteConfig, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getStaticRoutes, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }, { type: 'Edge', id: 'ROUTES' }]
    }),
    updateStaticRoutes: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateStaticRoutes, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'ROUTES' }]
    }),
    getEdgePortsStatusList: build.query<EdgePortStatus[], RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgePortStatusList, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: TableResult<EdgePortStatus>) {
        return result?.data
      }
    }),
    getLatestEdgeFirmware: build.query<LatestEdgeFirmwareVersion[], RequestPayload>({
      query: () => {
        const req = createHttpRequest(EdgeUrlsInfo.getLatestEdgeFirmware)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'FIRMWARE_LIST' }]
    }),
    getVenueEdgeFirmwareList: build.query<EdgeVenueFirmware[], RequestPayload>({
      query: () => {
        const req = createHttpRequest(EdgeUrlsInfo.getVenueEdgeFirmwareList)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'FIRMWARE_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update Edge Firmware Now'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'FIRMWARE_LIST' }]))
          })
        })
      }
    }),
    getAvailableEdgeFirmwareVersions: build.query<EdgeFirmwareVersion[], RequestPayload>({
      query: () => {
        const req = createHttpRequest(EdgeUrlsInfo.getAvailableEdgeFirmwareVersions)
        return {
          ...req
        }
      }
    }),
    updateEdgeFirmware: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateEdgeFirmware)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'FIRMWARE_LIST' }]
    }),
    rebootEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeUrlsInfo.reboot, params)
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }, { type: 'Edge', id: 'DETAIL' }]
    }),
    factoryResetEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeUrlsInfo.factoryReset, params)
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }, { type: 'Edge', id: 'DETAIL' }]
    })
  })
})

export const {
  useAddEdgeMutation,
  useGetEdgeQuery,
  useUpdateEdgeMutation,
  useGetEdgeListQuery,
  useLazyGetEdgeListQuery,
  useDeleteEdgeMutation,
  useSendOtpMutation,
  useGetDnsServersQuery,
  useUpdateDnsServersMutation,
  useGetPortConfigQuery,
  useUpdatePortConfigMutation,
  useGetSubInterfacesQuery,
  useAddSubInterfacesMutation,
  useUpdateSubInterfacesMutation,
  useDeleteSubInterfacesMutation,
  useGetStaticRoutesQuery,
  useUpdateStaticRoutesMutation,
  useEdgeBySerialNumberQuery,
  useGetEdgePortsStatusListQuery,
  useGetAvailableEdgeFirmwareVersionsQuery,
  useGetVenueEdgeFirmwareListQuery,
  useUpdateEdgeFirmwareMutation,
  useGetLatestEdgeFirmwareQuery,
  useRebootEdgeMutation,
  useFactoryResetEdgeMutation
} = edgeApi
