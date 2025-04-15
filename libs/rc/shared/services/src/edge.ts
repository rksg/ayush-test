/* eslint-disable max-len */
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { findIndex }           from 'lodash'

import {
  Filter
} from '@acx-ui/components'
import {
  ApiVersionEnum,
  ClusterArpTerminationSettings,
  ClusterNetworkSettings,
  ClusterSubInterfaceSettings,
  CommonResult,
  EdgeAllPortTrafficData,
  EdgeCluster,
  EdgeClusterService,
  EdgeClusterStatus,
  EdgeClusterTableDataType,
  EdgeDnsServers,
  EdgeFeatureSets,
  EdgeFeatureSetsV1_1,
  EdgeGeneralSetting,
  EdgeLag,
  EdgeLagStatus,
  EdgeNodesPortsInfo,
  EdgePasswordDetail,
  EdgePort,
  EdgePortConfig,
  EdgePortInfo,
  EdgePortStatus,
  EdgePortTypeEnum,
  EdgePortWithStatus,
  EdgeResourceUtilizationData,
  EdgeSdLanApCompatibilitiesResponse,
  EdgeSerialNumber,
  EdgeService,
  EdgeServiceCompatibilitiesResponse,
  EdgeServiceCompatibilitiesResponseV1_1,
  EdgeServicesApCompatibilitiesResponse,
  EdgeStaticRouteConfig,
  EdgeStatus,
  EdgeSubInterface,
  EdgeTimeSeriesPayload,
  EdgeTopTraffic,
  EdgeTotalUpDownTime,
  EdgeUrlsInfo,
  EdgesTopResources,
  EdgesTopTraffic,
  GetApiVersionHeader,
  PaginationQueryResult,
  PingEdge,
  SEARCH,
  SORTER,
  TableResult,
  TraceRouteEdge,
  VenueEdgeCompatibilitiesResponse,
  VenueEdgeCompatibilitiesResponseV1_1,
  downloadFile,
  getEdgePortIpModeEnumValue,
  onActivityMessageReceived,
  onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseEdgeApi }    from '@acx-ui/store'
import { RequestPayload } from '@acx-ui/types'
import {
  createHttpRequest,
  getEnabledDialogImproved,
  ignoreErrorModal
} from '@acx-ui/utils'

import { isPayloadHasField } from './utils'

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
    addEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.addEdge, params, getEnabledDialogImproved() ? {} : {
          ...ignoreErrorModal
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [
        { type: 'Edge', id: 'LIST' },
        { type: 'Edge', id: 'CLUSTER_LIST' }
      ]
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
      invalidatesTags: [
        { type: 'Edge', id: 'LIST' },
        { type: 'Edge', id: 'DETAIL' },
        { type: 'Edge', id: 'CLUSTER_LIST' }
      ]
    }),
    getEdgeList: build.query<TableResult<EdgeStatus>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const edgeListReq = {
          ...createHttpRequest(EdgeUrlsInfo.getEdgeList, arg.params),
          body: arg.payload
        }
        const edgeListQuery = await fetchWithBQ(edgeListReq)
        const edgeList = edgeListQuery.data as TableResult<EdgeStatus>
        const edgesData = edgeList?.data as EdgeStatus[]

        const edgeIds = edgesData.map(i => i.serialNumber)

        // base on current usecase, no need to support cross venue-edges incompatible check
        const venueFilter = ((arg.payload as Record<string, unknown>).filters as Record<string, unknown>)?.['venueId']
        if (edgeIds.length && venueFilter && (isPayloadHasField(arg.payload, 'incompatible') || isPayloadHasField(arg.payload, 'incompatibleV1_1'))) {
          const apiVer1_1 = isPayloadHasField(arg.payload, 'incompatibleV1_1')
          try {
            const edgeCompatibilitiesUrl = apiVer1_1 ? EdgeUrlsInfo.getVenueEdgeCompatibilitiesV1_1 : EdgeUrlsInfo.getVenueEdgeCompatibilities
            const edgeCompatibilitiesPayload = { filters: { venueIds: venueFilter, edgeIds: edgeIds } }
            const compatibilityReq = {
              ...createHttpRequest(edgeCompatibilitiesUrl, arg.params),
              body: JSON.stringify(edgeCompatibilitiesPayload)
            }

            const compatibilityQuery = await fetchWithBQ(compatibilityReq)
            const compatibilities = apiVer1_1
              ? compatibilityQuery.data as VenueEdgeCompatibilitiesResponseV1_1
              : compatibilityQuery.data as VenueEdgeCompatibilitiesResponse

            compatibilities.compatibilities?.forEach((item) => {
              const idx = findIndex(edgesData, { serialNumber: item.id })
              if (idx !== -1)
                edgesData[idx].incompatible = item.incompatibleFeatures?.length ?? 0
            })
          } catch (e) {
          // eslint-disable-next-line no-console
            console.error('venuesTable getEdgeCompatibilitiesVenue error:', e)
          }
        }

        edgeStatusTransformer(edgeList.data)

        return edgeListQuery.data
          ? { data: edgeList }
          : { error: edgeListQuery.error as FetchBaseQueryError }
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
        edgeStatusTransformer(result.data)
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
        const urlInfo = (params?.venueId && params?.edgeClusterId)
          ? EdgeUrlsInfo.getPortConfig : EdgeUrlsInfo.getPortConfigDeprecated
        const req = createHttpRequest(urlInfo, params)
        return {
          ...req
        }
      },
      transformResponse: (response: EdgePortConfig) => {
        response.ports?.sort(physicalPortSorter)
        return response
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
        const urlInfo = (params?.venueId && params?.edgeClusterId)
          ? EdgeUrlsInfo.updatePortConfig : EdgeUrlsInfo.updatePortConfigDeprecated
        const req = createHttpRequest(urlInfo, params)
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
    getEdgePortsStatusList: build.query<TableResult<EdgePortStatus>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgePortStatusList, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (response: TableResult<EdgePortStatus>) => {
        response.data?.sort(physicalPortSorter)
        return response
      },
      providesTags: [{ type: 'Edge', id: 'PORT' }]
    }),
    getEdgeSubInterfacesStatusList: build.query<TableResult<EdgePortInfo>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeSubInterfacesStatusList)
        return {
          ...req,
          body: payload
        }
      },
      extraOptions: { maxRetries: 5 },
      transformResponse (result: TableResult<EdgePortStatus>) {
        return {
          ...result,
          data: convertToEdgePortInfo(result?.data)
        }
      },
      providesTags: [{ type: 'Edge', id: 'SUB_INTERFACE' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update sub-interfaces'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'SUB_INTERFACE' }]))
          })
        })
      }
    }),
    rebootEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeUrlsInfo.reboot, params)
      },
      invalidatesTags: [{ type: 'Edge', id: 'LIST' }, { type: 'Edge', id: 'DETAIL' },
        { type: 'Edge', id: 'CLUSTER_LIST' }]
    }),
    shutdownEdge: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeUrlsInfo.shutdown, params)
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
        const req = createHttpRequest(EdgeUrlsInfo.downloadEdgesCSV,
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
            'Update LAG sub-interface',
            'Update LAG sub-interfaces'
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
    getEdgeLagSubInterfacesStatusList: build.query<TableResult<EdgePortInfo>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getLagSubInterfacesStatus, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: TableResult<EdgeLagStatus>) {
        return {
          ...result,
          data: convertToEdgePortInfo(result?.data)
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update LAG sub-interface',
            'Update LAG sub-interfaces'
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
            edgeStatusTransformer(tmp.children)
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
    getEdgeFeatureSets: build.query<EdgeFeatureSets, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeFeatureSets, params)
        return {
          ...req,
          body: payload
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    getEdgeFeatureSetsV1_1: build.query<EdgeFeatureSetsV1_1, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeFeatureSetsV1_1, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    getVenueEdgeCompatibilities: build.query<VenueEdgeCompatibilitiesResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getVenueEdgeCompatibilities, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'VENUE_COMPATIBILITY' }]
    }),
    getVenueEdgeCompatibilitiesV1_1: build.query<VenueEdgeCompatibilitiesResponseV1_1, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getVenueEdgeCompatibilitiesV1_1, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Edge', id: 'VENUE_COMPATIBILITY' }]
    }),
    getSdLanEdgeCompatibilities: build.query<EdgeServiceCompatibilitiesResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getSdLanEdgeCompatibilities, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'SDLAN_EDGE_COMPATIBILITY' }]
    }),
    getSdLanEdgeCompatibilitiesV1_1: build.query<EdgeServiceCompatibilitiesResponseV1_1, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getSdLanEdgeCompatibilitiesV1_1, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Edge', id: 'SDLAN_EDGE_COMPATIBILITY' }]
    }),
    getSdLanApCompatibilitiesDeprecated: build.query<EdgeSdLanApCompatibilitiesResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getSdLanApCompatibilities, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'SDLAN_AP_COMPATIBILITY' }]
    }),
    getSdLanApCompatibilities: build.query<EdgeServicesApCompatibilitiesResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(EdgeUrlsInfo.getSdLanApCompatibilities, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Edge', id: 'SDLAN_AP_COMPATIBILITY' }]
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
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeClusterNetworkSettings, params)
        return {
          ...req
        }
      },
      transformResponse: (response: ClusterNetworkSettings) => {
        response.portSettings?.forEach(portSetting => portSetting.ports?.sort(physicalPortSorter))
        return response
      },
      providesTags: [{ type: 'Edge', id: 'CLUSTER_DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update LAG, port and virtual IP settings'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'CLUSTER_DETAIL' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    updateEdgeClusterArpTerminationSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.updateEdgeClusterArpTerminationSettings, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'ARP_TERMINATION' }]
    }),
    getEdgeClusterArpTerminationSettings: build.query<ClusterArpTerminationSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeClusterArpTerminationSettings, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'ARP_TERMINATION' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update ARP Termination Settings'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'ARP_TERMINATION' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    patchEdgeClusterSubInterfaceSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.patchEdgeClusterSubInterfaceSettings, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Edge', id: 'CLUSTER_DETAIL' }]
    }),
    getEdgeClusterSubInterfaceSettings: build.query<ClusterSubInterfaceSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeClusterSubInterfaceSettings, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Edge', id: 'CLUSTER_DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'update-cluster-sub-interfaces'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'CLUSTER_DETAIL' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getEdgesPortStatus: build.query<EdgeNodesPortsInfo, RequestPayload>({
      queryFn: async ({ payload }, _queryApi, _extraOptions, fetchWithBQ) => {
        const { edgeIds, includeLags = false } = payload as {
          edgeIds: EdgeSerialNumber[]
          includeLags?: boolean
        }
        const result = {} as EdgeNodesPortsInfo

        for(let edgeId of edgeIds) {
          const tmp = [] as (EdgePortStatus | EdgeLagStatus)[]
          const params = { serialNumber: edgeId }
          const edgePortListReq = createHttpRequest(EdgeUrlsInfo.getEdgePortStatusList, params)
          const edgePortList = await fetchWithBQ({
            ...edgePortListReq,
            body: {
              sortField: 'sortIdx',
              sortOrder: 'ASC'
            }
          })
          const edgePorts = (edgePortList.data as TableResult<EdgePortStatus>).data
          edgePorts?.sort(physicalPortSorter)
          tmp.push(...edgePorts)

          const edgeLagListReq = createHttpRequest(EdgeUrlsInfo.getEdgeLagStatusList, params)
          const edgeLagList = await fetchWithBQ({ ...edgeLagListReq, body: {} })
          tmp.push(...((edgeLagList.data as TableResult<EdgeLagStatus>).data))
          // filter ports
          result[edgeId] = convertToEdgePortInfo(tmp, !includeLags)
        }

        return { data: result }
      },
      providesTags: [{ type: 'Edge', id: 'PORT_STATUS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update LAG, port and virtual IP settings',
            'Add LAG',
            'Update LAG',
            'Delete LAG'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(edgeApi.util.invalidateTags([{ type: 'Edge', id: 'PORT_STATUS' }]))
          })
        })
      }
    }),
    getHqosEdgeCompatibilities: build.query<EdgeServiceCompatibilitiesResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getHqosEdgeCompatibilities, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'HQOS_EDGE_COMPATIBILITY' }]
    }),
    getHqosEdgeCompatibilitiesV1_1: build.query<EdgeServiceCompatibilitiesResponseV1_1, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getHqosEdgeCompatibilitiesV1_1, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Edge', id: 'HQOS_EDGE_COMPATIBILITY' }]
    }),
    getPinEdgeCompatibilities: build.query<EdgeServiceCompatibilitiesResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getPinEdgeCompatibilities, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'PIN_EDGE_COMPATIBILITY' }]
    }),
    getPinEdgeCompatibilitiesV1_1: build.query<EdgeServiceCompatibilitiesResponseV1_1, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getPinEdgeCompatibilitiesV1_1, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Edge', id: 'PIN_EDGE_COMPATIBILITY' }]
    }),
    getPinApCompatibilities: build.query<EdgeServicesApCompatibilitiesResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getPinApCompatibilities, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'PIN_AP_COMPATIBILITY' }]
    }),
    getMdnsEdgeCompatibilities: build.query<EdgeServiceCompatibilitiesResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getMdnsEdgeCompatibilities, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Edge', id: 'MDNS_EDGE_COMPATIBILITY' }]
    }),
    getMdnsEdgeCompatibilitiesV1_1: build.query<EdgeServiceCompatibilitiesResponseV1_1, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getMdnsEdgeCompatibilitiesV1_1, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Edge', id: 'MDNS_EDGE_COMPATIBILITY' }]
    }),
    getEdgeClusterServiceList: build.query<TableResult<EdgeClusterService>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeUrlsInfo.getEdgeClusterServiceList)
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
    })
  })
})

const edgeStatusTransformer = (data: EdgeStatus[]) => {
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
      vlan: item.vlan,
      status: item.status,
      isCorePort: item.isCorePort === 'Enabled',
      portEnabled: item.adminStatus === 'Enabled'
    }
  })

  return data.filter(d => !!d) as EdgePortInfo[]
}

const physicalPortSorter = (
  a: EdgePort | EdgePortStatus,
  b: EdgePort | EdgePortStatus
) => {
  const aMatch = a.interfaceName?.match(/^port(\d+)$/)
  const bMatch = b.interfaceName?.match(/^port(\d+)$/)

  if (aMatch && bMatch) {
    return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10)
  }
  return aMatch ? -1 : bMatch ? 1 : 0
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
  useShutdownEdgeMutation,
  useFactoryResetEdgeMutation,
  useDownloadEdgesCSVMutation,
  useGetEdgeUptimeQuery,
  useLazyGetEdgeUptimeQuery,
  useGetEdgeTopTrafficQuery,
  useGetEdgeResourceUtilizationQuery,
  useGetEdgePortTrafficQuery,
  useLazyGetEdgePortTrafficQuery,
  useGetEdgeServiceListQuery,
  useGetEdgeClusterServiceListQuery,
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
  useUpdateEdgeClusterArpTerminationSettingsMutation,
  useGetEdgeClusterArpTerminationSettingsQuery,
  usePatchEdgeClusterSubInterfaceSettingsMutation,
  useGetEdgeClusterSubInterfaceSettingsQuery,
  useGetEdgesPortStatusQuery,
  useLazyGetEdgesPortStatusQuery,
  useGetEdgeFeatureSetsQuery,
  useLazyGetEdgeFeatureSetsQuery,
  useGetVenueEdgeCompatibilitiesQuery,
  useLazyGetVenueEdgeCompatibilitiesQuery,
  useGetSdLanEdgeCompatibilitiesQuery,
  useLazyGetSdLanEdgeCompatibilitiesQuery,
  useGetSdLanApCompatibilitiesQuery,
  useLazyGetSdLanApCompatibilitiesQuery,
  useLazyGetSdLanApCompatibilitiesDeprecatedQuery,
  useGetHqosEdgeCompatibilitiesQuery,
  useLazyGetHqosEdgeCompatibilitiesQuery,
  useGetPinEdgeCompatibilitiesQuery,
  useLazyGetPinEdgeCompatibilitiesQuery,
  useLazyGetPinApCompatibilitiesQuery,
  useLazyGetMdnsEdgeCompatibilitiesQuery,
  useGetEdgeFeatureSetsV1_1Query,
  useLazyGetEdgeFeatureSetsV1_1Query,
  useGetVenueEdgeCompatibilitiesV1_1Query,
  useLazyGetVenueEdgeCompatibilitiesV1_1Query,
  useGetSdLanEdgeCompatibilitiesV1_1Query,
  useLazyGetSdLanEdgeCompatibilitiesV1_1Query,
  useGetHqosEdgeCompatibilitiesV1_1Query,
  useLazyGetHqosEdgeCompatibilitiesV1_1Query,
  useGetPinEdgeCompatibilitiesV1_1Query,
  useLazyGetPinEdgeCompatibilitiesV1_1Query,
  useGetMdnsEdgeCompatibilitiesV1_1Query,
  useLazyGetMdnsEdgeCompatibilitiesV1_1Query
} = edgeApi