import {
  Filter
} from '@acx-ui/components'
import {
  CommonResult,
  PingEdge,
  TraceRouteEdge,
  EdgeDnsServers,
  EdgeGeneralSetting,
  EdgePortConfig,
  EdgeStaticRouteConfig,
  EdgeStatus,
  EdgeSubInterface,
  EdgePortStatus,
  EdgeUrlsInfo,
  PaginationQueryResult,
  TableResult,
  LatestEdgeFirmwareVersion,
  EdgeVenueFirmware,
  EdgeFirmwareVersion,
  onSocketActivityChanged,
  onActivityMessageReceived,
  downloadFile,
  SEARCH,
  SORTER,
  EdgeTotalUpDownTime,
  EdgeTopTraffic,
  EdgeResourceUtilizationData,
  EdgeAllPortTrafficData,
  EdgeTimeSeriesPayload,
  EdgeService,
  EdgesTopTraffic,
  EdgesTopResources,
  EdgePasswordDetail
} from '@acx-ui/rc/utils'
import { baseEdgeApi }                         from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

export type EdgesExportPayload = {
  filters: Filter
  tenantId: string
} & SEARCH & SORTER

export const edgeApi = baseEdgeApi.injectEndpoints({
  endpoints: (build) => ({
    addEdge: build.mutation<EdgeGeneralSetting, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.addEdge, undefined, {
          ...ignoreErrorModal
        })
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
      transformResponse: (result: TableResult<EdgeStatus>) => {
        EdgeStatusTransformer(result.data)
        return result
      },
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
      },
      extraOptions: { maxRetries: 5 }
    }),
    deleteEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        if (payload) { //delete multiple rows
          const req = createHttpRequest(EdgeUrlsInfo.deleteEdges)
          return {
            ...req,
            body: payload
          }
        } else { //delete single row
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
        EdgeStatusTransformer(result.data)
        return result.data[0]
      }
    }),
    getDnsServers: build.query<EdgeDnsServers, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getDnsServers, params, {
          ...ignoreErrorModal
        })
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
      providesTags: [{ type: 'Edge', id: 'DETAIL' }, { type: 'Edge', id: 'PORT' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update ports'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'PORT' }]))
          })
        })
      }
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
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update sub-interfaces'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'SUB_INTERFACE' }]))
          })
        })
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }, { type: 'Edge', id: 'SUB_INTERFACE' }],
      extraOptions: { maxRetries: 5 }
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
    getEdgeSubInterfacesStatusList: build.query<TableResult<EdgePortStatus>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeSubInterfacesStatusList)
        return {
          ...req,
          body: payload
        }
      },
      extraOptions: { maxRetries: 5 }
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
    }),
    pingEdge: build.mutation<PingEdge, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.pingEdge, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    traceRouteEdge: build.mutation<TraceRouteEdge, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.traceRouteEdge, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    downloadEdgesCSV: build.mutation<Blob, EdgesExportPayload>({
      query: (payload) => {
        const req = createHttpRequest(EdgeUrlsInfo.downloadSwitchsCSV,
          { tenantId: payload.tenantId }
        )
        return {
          ...req,
          body: payload,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'download.csv'
            downloadFile(response, fileName)
          }
        }
      }
    }),
    getEdgeUptime: build.query<EdgeTotalUpDownTime, RequestPayload<EdgeTimeSeriesPayload>>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(EdgeUrlsInfo.getEdgeUpDownTime, params),
          body: payload
        }
      }
    }),
    getEdgeTopTraffic: build.query<EdgeTopTraffic, RequestPayload<EdgeTimeSeriesPayload>>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(EdgeUrlsInfo.getEdgeTopTraffic, params),
          body: payload
        }
      }
    }),
    getEdgeResourceUtilization: build.query<EdgeResourceUtilizationData,
      RequestPayload<EdgeTimeSeriesPayload>>({
        query: ({ params, payload }) => {
          return {
            ...createHttpRequest(EdgeUrlsInfo.getEdgeResourceUtilization, params),
            body: payload
          }
        }
      }),
    // eslint-disable-next-line max-len
    getEdgePortTraffic: build.query<EdgeAllPortTrafficData, RequestPayload<EdgeTimeSeriesPayload>>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(EdgeUrlsInfo.getEdgePortTraffic, params),
          body: payload
        }
      }
    }),
    getEdgeServiceList: build.query<TableResult<EdgeService>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeServiceList)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'LIST' }, { type: 'Edge', id: 'SERVICE' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Remove Services'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'SERVICE' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getEdgesTopTraffic: build.query<EdgesTopTraffic,
      RequestPayload<EdgeTimeSeriesPayload>>({
        query: ({ payload }) => {
          const req = createHttpRequest(EdgeUrlsInfo.getEdgesTopTraffic)
          return {
            ...req,
            body: payload
          }
        }
      }),
    getEdgesTopResources: build.query<EdgesTopResources,
      RequestPayload<EdgeTimeSeriesPayload>>({
        query: ({ payload }) => {
          const req = createHttpRequest(EdgeUrlsInfo.getEdgesTopResources)
          return {
            ...req,
            body: payload
          }
        }
      }),
    deleteEdgeServices: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.deleteService, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'SERVICE' }]
    }),
    getEdgePasswordDetail: build.query<EdgePasswordDetail, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgePasswordDetail, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }]
    }),
    importSubInterfacesCSV: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.importSubInterfacesCSV, params, {
          ...ignoreErrorModal,
          'Content-Type': undefined
        })
        return {
          ...req,
          body: payload
        }
      }
    })
  })
})

const EdgeStatusTransformer = (data: EdgeStatus[]) => {
  data.forEach(item => {
    if (item?.memoryUsedKb)
      item.memoryUsed = item?.memoryUsedKb * 1024
    if (item?.memoryTotalKb)
      item.memoryTotal = item?.memoryTotalKb * 1024
    if (item?.diskUsedKb)
      item.diskUsed = item?.diskUsedKb * 1024
    if (item?.diskTotalKb)
      item.diskTotal = item?.diskTotalKb * 1024
  })
  return data
}

export const {
  useAddEdgeMutation,
  useGetEdgeQuery,
  usePingEdgeMutation,
  useTraceRouteEdgeMutation,
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
  useGetEdgeSubInterfacesStatusListQuery,
  useGetAvailableEdgeFirmwareVersionsQuery,
  useGetVenueEdgeFirmwareListQuery,
  useUpdateEdgeFirmwareMutation,
  useGetLatestEdgeFirmwareQuery,
  useRebootEdgeMutation,
  useFactoryResetEdgeMutation,
  useDownloadEdgesCSVMutation,
  useGetEdgeUptimeQuery,
  useGetEdgeTopTrafficQuery,
  useGetEdgeResourceUtilizationQuery,
  useGetEdgePortTrafficQuery,
  useGetEdgeServiceListQuery,
  useGetEdgesTopTrafficQuery,
  useGetEdgesTopResourcesQuery,
  useDeleteEdgeServicesMutation,
  useGetEdgePasswordDetailQuery,
  useImportSubInterfacesCSVMutation
} = edgeApi
