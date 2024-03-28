/* eslint-disable max-len */
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query/fetchBaseQuery'

import {
  Filter
} from '@acx-ui/components'
import {
  ClusterNetworkSettings,
  CommonResult,
  EdgeAllPortTrafficData,
  EdgeCluster,
  EdgeClusterStatus,
  EdgeClusterTableDataType,
  EdgeDnsServers,
  EdgeGeneralSetting,
  EdgeLag,
  EdgeLagStatus,
  EdgeNodesPortsInfo,
  EdgePasswordDetail,
  EdgePortConfig,
  EdgePortInfo,
  EdgePortStatus,
  EdgePortTypeEnum,
  EdgePortWithStatus,
  EdgeResourceUtilizationData,
  EdgeSerialNumber,
  EdgeService,
  EdgeStaticRouteConfig,
  EdgeStatus,
  EdgeSubInterface,
  EdgeTimeSeriesPayload,
  EdgeTopTraffic,
  EdgeTotalUpDownTime,
  EdgeUrlsInfo,
  EdgesTopResources,
  EdgesTopTraffic,
  PaginationQueryResult,
  PingEdge,
  SEARCH,
  SORTER,
  TableResult,
  TraceRouteEdge,
  downloadFile,
  getEdgePortIpModeEnumValue,
  onActivityMessageReceived,
  onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseEdgeApi }                         from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

export type EdgesExportPayload = {
  filters: Filter
  tenantId: string
} & SEARCH & SORTER

const versionHeader = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}

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
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }, { type: 'Edge', id: 'CLUSTER_LIST' }]
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
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }, { type: 'Edge', id: 'DETAIL' },
        { type: 'Edge', id: 'CLUSTER_LIST' }]
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
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }, { type: 'Edge', id: 'CLUSTER_LIST' }]
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
        const req = createHttpRequest(EdgeUrlsInfo.getSubInterfaces, params, versionHeader)
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
        const req = createHttpRequest(EdgeUrlsInfo.addSubInterfaces, params, versionHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'SUB_INTERFACE' }]
    }),
    updateSubInterfaces: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateSubInterfaces, params, versionHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'SUB_INTERFACE' }]
    }),
    deleteSubInterfaces: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.deleteSubInterfaces, params, versionHeader)
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
      },
      providesTags: [{ type: 'Edge', id: 'PORT' }]
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
    rebootEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeUrlsInfo.reboot, params)
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }, { type: 'Edge', id: 'DETAIL' },
        { type: 'Edge', id: 'CLUSTER_LIST' }]
    }),
    factoryResetEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeUrlsInfo.factoryReset, params)
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }, { type: 'Edge', id: 'DETAIL' },
        { type: 'Edge', id: 'CLUSTER_LIST' }]
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
          'Content-Type': undefined,
          'Accept': versionHeader.Accept
        })
        return {
          ...req,
          body: payload
        }
      }
    }),
    getEdgeLagsStatusList: build.query<TableResult<EdgeLagStatus>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeLagStatusList, params)
        return {
          ...req,
          body: payload
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Add LAG',
            'Update LAG',
            'Delete LAG'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'LAG' }]))
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'PORT' }]))
          })
        })
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }, { type: 'Edge', id: 'LAG' }],
      extraOptions: { maxRetries: 5 }
    }),
    getEdgePortListWithStatus: build.query<EdgePortWithStatus[], RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const portsReq = createHttpRequest(
          EdgeUrlsInfo.getPortConfig, arg.params)
        const portQuery = await fetchWithBQ(portsReq)
        const ports = portQuery.data as EdgePortConfig

        // fetch physical port status
        const portsStatusReq = createHttpRequest(
          EdgeUrlsInfo.getEdgePortStatusList, arg.params)
        const portStatusQuery = await fetchWithBQ({
          ...portsStatusReq,
          body: arg.payload
        })

        const portsStatusTableResult = portStatusQuery.data as TableResult<EdgePortStatus>
        const statusIpMap = Object.fromEntries((portsStatusTableResult.data || [])
          .map(status => [status.portId, status.ip]))

        const portDataWithStatusIp = ports.ports.map((item) => {
          return { ...item, statusIp: statusIpMap[item.id ?? ''] }
        })

        return portQuery.data
          ? { data: portDataWithStatusIp }
          : { error: portQuery.error as FetchBaseQueryError }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update ports'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'PORT' }]))
          })
        })
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }, { type: 'Edge', id: 'PORT' }],
      extraOptions: { maxRetries: 5 }
    }),
    getEdgeLagList: build.query<TableResult<EdgeLag>, RequestPayload>({
      query: ({ params, payload }) => {
        const { page, pageSize } = payload as { page: number, pageSize: number }
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeLagList, params)
        return {
          ...req,
          params: { page, pageSize }
        }
      },
      transformResponse (response: PaginationQueryResult<EdgeLag>) {
        return {
          data: response.content,
          page: response.page,
          totalCount: response.totalCount
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Add LAG',
            'Update LAG',
            'Delete LAG'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'LAG' }]))
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'PORT' }]))
          })
        })
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }, { type: 'Edge', id: 'LAG' }],
      extraOptions: { maxRetries: 5 }
    }),
    addEdgeLag: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.addEdgeLag, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LAG' }]
    }),
    updateEdgeLag: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateEdgeLag, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LAG' }]
    }),
    deleteEdgeLag: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.deleteEdgeLag, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LAG' }]
    }),
    getLagSubInterfaces: build.query<TableResult<EdgeSubInterface>, RequestPayload>({
      query: ({ params, payload }) => {
        const { page, pageSize } = payload as { page: number, pageSize: number }
        const req = createHttpRequest(EdgeUrlsInfo.getLagSubInterfaces, params)
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
            'Update LAG sub-interface'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'LAG_SUB_INTERFACE' }]))
          })
        })
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }, { type: 'Edge', id: 'LAG_SUB_INTERFACE' }],
      extraOptions: { maxRetries: 5 }
    }),
    addLagSubInterfaces: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.addLagSubInterfaces, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LAG_SUB_INTERFACE' }]
    }),
    updateLagSubInterfaces: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateLagSubInterfaces, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LAG_SUB_INTERFACE' }]
    }),
    deleteLagSubInterfaces: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.deleteLagSubInterfaces, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'LAG_SUB_INTERFACE' }]
    }),
    importLagSubInterfacesCSV: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.importLagSubInterfacesCSV, params, {
          ...ignoreErrorModal,
          'Content-Type': undefined
        })
        return {
          ...req,
          body: payload
        }
      }
    }),
    getEdgeLagSubInterfacesStatusList: build.query<TableResult<EdgeLagStatus>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getLagSubInterfacesStatus, params)
        return {
          ...req,
          body: payload
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update LAG sub-interface'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'LAG_SUB_INTERFACE' }]))
          })
        })
      },
      providesTags: [{ type: 'Edge', id: 'DETAIL' }, { type: 'Edge', id: 'LAG_SUB_INTERFACE' }],
      extraOptions: { maxRetries: 5 }
    }),
    getEdgeClusterList: build.query<TableResult<EdgeClusterStatus>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeClusterStatusList)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'CLUSTER_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Add Edge',
            'Delete Edges',
            'Create SmartEdge cluster',
            'Delete SmartEdge clusters'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'CLUSTER_LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getEdgeClusterListForTable: build.query<TableResult<EdgeClusterTableDataType>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeClusterStatusList)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'CLUSTER_LIST' }],
      transformResponse: (result: TableResult<EdgeClusterStatus>) => {
        result.data = result.data.map(item => {
          const tmp = {
            ...item,
            isFirstLevel: true
          } as EdgeClusterTableDataType
          if(item.edgeList) {
            tmp.children = item.edgeList
            delete item.edgeList
            if (tmp.children.length < 2)
              // remove the HA status for 1 node case
              tmp.children.forEach((edgeStat: EdgeStatus) => delete edgeStat.haStatus)
            EdgeStatusTransformer(tmp.children)
          }
          return tmp
        })
        return result as TableResult<EdgeClusterTableDataType>
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Add Edge',
            'Delete Edges',
            'Create SmartEdge cluster',
            'Delete SmartEdge clusters',
            'Update SmartEdge cluster'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'CLUSTER_LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    addEdgeCluster: build.mutation<unknown, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.addEdgeCluster, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'CLUSTER_LIST' }]
    }),
    deleteEdgeCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeUrlsInfo.deleteEdgeCluster, params)
      },
      invalidatesTags: [{ type: 'Edge', id: 'CLUSTER_LIST' }]
    }),
    getAllInterfacesByType: build.query<{ [key: string]: EdgePortInfo[] }, RequestPayload>({
      queryFn: async ({ payload }, _queryApi, _extraOptions, fetchWithBQ) => {
        const { edgeIds, portTypes } = payload as { edgeIds: string[], portTypes: EdgePortTypeEnum[] }
        const result = {} as { [key: string]: EdgePortInfo[] }
        for(let edgeId of edgeIds) {
          const tmp = [] as (EdgePortStatus | EdgeLagStatus)[]
          const params = { serialNumber: edgeId }
          const edgePortListReq = createHttpRequest(EdgeUrlsInfo.getEdgePortStatusList, params)
          const edgePortList = await fetchWithBQ({ ...edgePortListReq, body: { filters: { type: portTypes } } })
          tmp.push(...((edgePortList.data as TableResult<EdgePortStatus>).data))
          const edgeLagListReq = createHttpRequest(EdgeUrlsInfo.getEdgeLagStatusList, params)
          const edgeLagList = await fetchWithBQ({ ...edgeLagListReq, body: { filters: { portType: portTypes } } })
          tmp.push(...((edgeLagList.data as TableResult<EdgeLagStatus>).data))
          const edgeSubInterfaceListReq = createHttpRequest(EdgeUrlsInfo.getEdgeSubInterfacesStatusList)
          const edgeSubInterfaceList = await fetchWithBQ({
            ...edgeSubInterfaceListReq,
            body: { filters: { type: portTypes, serialNumber: [edgeId] } } }
          )
          tmp.push(...((edgeSubInterfaceList.data as TableResult<EdgePortStatus>).data))
          const edgeLagSubInterfaceListReq = createHttpRequest(EdgeUrlsInfo.getLagSubInterfacesStatus, params)
          const edgeLagSubInterfaceList = await fetchWithBQ({ ...edgeLagSubInterfaceListReq, body: { filters: { portType: portTypes } } })
          tmp.push(...((edgeLagSubInterfaceList.data as TableResult<EdgePortStatus>).data))
          result[edgeId] = convertToEdgePortInfo(tmp)
        }
        return { data: result }
      }
    }),
    patchEdgeCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.patchEdgeCluster, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'CLUSTER_LIST' }, { type: 'Edge', id: 'CLUSTER_DETAIL' }]
    }),
    getEdgeCluster: build.query<EdgeCluster, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeCluster, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'CLUSTER_DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Create SmartEdge cluster',
            'Delete SmartEdge clusters',
            'Update SmartEdge cluster'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'CLUSTER_DETAIL' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    patchEdgeClusterNetworkSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.patchEdgeClusterNetworkSettings, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'CLUSTER_LIST' }, { type: 'Edge', id: 'CLUSTER_DETAIL' }]
    }),
    getEdgeClusterNetworkSettings: build.query<ClusterNetworkSettings, RequestPayload>({
      queryFn: async ({ params }, _queryApi, _extraOptions, fetchWithBQ) => {
        const result = {} as ClusterNetworkSettings
        const getClusterReq = createHttpRequest(EdgeUrlsInfo.getEdgeCluster, params)
        const clusterInfo = (await fetchWithBQ(getClusterReq)).data as EdgeCluster
        result.virtualIpSettings = clusterInfo?.virtualIpSettings?.virtualIps
        const lagSettings = []
        const portSettings = []
        for(let edge of clusterInfo.smartEdges) {
          const apiParams = {
            venueId: params?.venueId,
            edgeClusterId: params?.clusterId,
            serialNumber: edge.serialNumber
          }
          const getEdgeLagReq = createHttpRequest(EdgeUrlsInfo.getEdgeLagList, apiParams)
          const edgeLagData = (await fetchWithBQ(getEdgeLagReq)).data as PaginationQueryResult<EdgeLag>
          if(edgeLagData.content) {
            lagSettings.push({
              serialNumber: edge.serialNumber,
              lags: edgeLagData.content
            })
          }
          const getEdgePortReq = createHttpRequest(EdgeUrlsInfo.getPortConfig, apiParams)
          const edgePortData = (await fetchWithBQ(getEdgePortReq)).data as EdgePortConfig
          if(edgePortData) {
            portSettings.push({
              serialNumber: edge.serialNumber,
              ports: edgePortData.ports
            })
          }
        }
        result.lagSettings = lagSettings
        result.portSettings = portSettings
        return { data: result }
      }
    }),
    getEdgesPortStatus: build.query<EdgeNodesPortsInfo, RequestPayload>({
      queryFn: async ({ payload }, _queryApi, _extraOptions, fetchWithBQ) => {
        const { edgeIds } = payload as { edgeIds: EdgeSerialNumber[] }
        const result = {} as EdgeNodesPortsInfo

        for(let edgeId of edgeIds) {
          const tmp = [] as (EdgePortStatus | EdgeLagStatus)[]
          const params = { serialNumber: edgeId }
          const edgePortListReq = createHttpRequest(EdgeUrlsInfo.getEdgePortStatusList, params)
          const edgePortList = await fetchWithBQ({ ...edgePortListReq, body: {} })
          tmp.push(...((edgePortList.data as TableResult<EdgePortStatus>).data))

          const edgeLagListReq = createHttpRequest(EdgeUrlsInfo.getEdgeLagStatusList, params)
          const edgeLagList = await fetchWithBQ({ ...edgeLagListReq, body: {} })
          tmp.push(...((edgeLagList.data as TableResult<EdgeLagStatus>).data))
          // filter ports
          result[edgeId] = convertToEdgePortInfo(tmp, true)
        }

        return { data: result }
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

const convertToEdgePortInfo = (interfaces: (EdgePortStatus | EdgeLagStatus)[], physicalOnly?: boolean) => {
  const data = interfaces.map(item => {
    const isPhysicalPort = item.hasOwnProperty('interfaceName')
    const lagList = interfaces.filter(interfaceData => !interfaceData.hasOwnProperty('interfaceName'))

    let portName = ''
    let id = ''
    let portType: EdgePortTypeEnum
    let isLagMember = false
    if (isPhysicalPort) {
      const ifData = (item as EdgePortStatus)
      id = ifData.portId
      portName = ifData.interfaceName ?? ''
      portType = ifData.type ?? ''
      isLagMember = !!lagList?.some(lag =>
        (lag as EdgeLagStatus).lagMembers?.some(member =>
          member.name === ifData.interfaceName))
    } else {
      const ifData = (item as EdgeLagStatus)
      id = `${ifData.lagId}`
      portName = ifData.name
      portType = ifData.portType
    }

    return (physicalOnly && !isPhysicalPort) ? '' : {
      serialNumber: item.serialNumber ?? '',
      id,
      portName,
      portType,
      isLag: !isPhysicalPort,
      isLagMember,
      ipMode: getEdgePortIpModeEnumValue(item.ipMode),
      ip: item.ip ?? '',
      mac: item.mac ?? '',
      subnet: item.subnet ?? '',
      isCorePort: item.isCorePort === 'Enabled',
      portEnabled: item.adminStatus === 'Enabled'
    }
  })

  return data.filter(d => !!d) as EdgePortInfo[]
}

export const {
  useAddEdgeMutation,
  useGetEdgeQuery,
  useLazyGetEdgeQuery,
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
  useLazyGetPortConfigQuery,
  useUpdatePortConfigMutation,
  useGetSubInterfacesQuery,
  useAddSubInterfacesMutation,
  useUpdateSubInterfacesMutation,
  useDeleteSubInterfacesMutation,
  useGetStaticRoutesQuery,
  useUpdateStaticRoutesMutation,
  useEdgeBySerialNumberQuery,
  useGetEdgePortsStatusListQuery,
  useLazyGetEdgePortsStatusListQuery,
  useGetEdgeSubInterfacesStatusListQuery,
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
  useImportSubInterfacesCSVMutation,
  useGetEdgeLagsStatusListQuery,
  useAddEdgeLagMutation,
  useDeleteEdgeLagMutation,
  useGetEdgeLagListQuery,
  useLazyGetEdgeLagListQuery,
  useAddLagSubInterfacesMutation,
  useGetLagSubInterfacesQuery,
  useDeleteLagSubInterfacesMutation,
  useUpdateLagSubInterfacesMutation,
  useUpdateEdgeLagMutation,
  useImportLagSubInterfacesCSVMutation,
  useGetEdgeLagSubInterfacesStatusListQuery,
  useGetEdgePortListWithStatusQuery,
  useGetEdgeClusterListForTableQuery,
  useGetEdgeClusterListQuery,
  useAddEdgeClusterMutation,
  useDeleteEdgeClusterMutation,
  useGetAllInterfacesByTypeQuery,
  usePatchEdgeClusterMutation,
  useGetEdgeClusterQuery,
  usePatchEdgeClusterNetworkSettingsMutation,
  useGetEdgeClusterNetworkSettingsQuery,
  useGetEdgesPortStatusQuery,
  useLazyGetEdgesPortStatusQuery
} = edgeApi