import {
  CommonResult,
  EdgeTnmServiceUrls,
  EdgeTnmServiceData,
  EdgeTnmHostSetting,
  EdgeTnmHostGraphConfig,
  EdgeTnmHostGroup,
  EdgeTnmGraphItem,
  EdgeTnmGraphItemInfo,
  EdgeTnmGraphHistory,
  EdgeNokiaOltData,
  EdgeNokiaCageData,
  EdgeNokiaOnuData,
  TableResult,
  EdgeUrlsInfo,
  EdgeClusterStatus,
  EdgeNokiaOltCreatePayload,
  EdgeNokiaCageStateEnum
} from '@acx-ui/rc/utils'
import { baseEdgeTnmServiceApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'

import { isFulfilled } from './utils'

export const edgeTnmServiceApi = baseEdgeTnmServiceApi.injectEndpoints({
  endpoints: (build) => ({
    getEdgeTnmServiceList:
      build.query<EdgeTnmServiceData[], RequestPayload>({
        query: () => {
          const req = createHttpRequest(EdgeTnmServiceUrls.getEdgeTnmServiceList)
          return {
            ...req
          }
        },
        providesTags: [{ type: 'EdgeTnmService', id: 'LIST' }]
      }),
    addEdgeTnmService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.activateEdgeTnmServiceAppCluster, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeTnmService', id: 'LIST' }]
    }),
    deleteEdgeTnmService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        //delete single row
        return createHttpRequest(EdgeTnmServiceUrls.deactivateEdgeTnmServiceAppCluster, params)
      },
      invalidatesTags: [{ type: 'EdgeTnmService', id: 'LIST' }]
    }),
    getEdgeTnmHostGraphsConfig: build.query<EdgeTnmHostGraphConfig[], RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeTnmServiceUrls.edgeTnmHostGraphsConfig, params)
      }
    }),
    getEdgeTnmHostGroupList: build.query<EdgeTnmHostGroup[], RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeTnmServiceUrls.getEdgeTnmHostGroupList, params)
      }
    }),
    getEdgeTnmHostList: build.query<EdgeTnmHostSetting[], RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeTnmServiceUrls.getEdgeTnmHostList, params)
      },
      providesTags: [{ type: 'EdgeTnmService', id: 'HOST_LIST' }]
    }),
    createEdgeTnmHost: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.createEdgeTnmHost, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeTnmService', id: 'HOST_LIST' }]
    }),
    updateEdgeTnmHost: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.updateEdgeTnmHost, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeTnmService', id: 'HOST_LIST' }]
    }),
    deleteEdgeTnmHost: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeTnmServiceUrls.deleteEdgeTnmHost, params)
      },
      invalidatesTags: [{ type: 'EdgeTnmService', id: 'HOST_LIST' }]
    }),
    getEdgeTnmGraphItems: build.query<EdgeTnmGraphItem[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.getEdgeTnmGraphItems, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeTnmService', id: 'GRAPH_ITEM_LIST' }]
    }),
    getEdgeTnmGraphItemsInfo: build.query<EdgeTnmGraphItemInfo[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.getEdgeTnmGraphItemsInfo, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getEdgeTnmGraphHistory: build.query<EdgeTnmGraphHistory[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.getEdgeTnmGraphHistory, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),

    // Edge Nokia OLT POC
    getEdgeOltList: build.query<EdgeNokiaOltData[], RequestPayload>({
      async queryFn (_reqApi, _queryApi, _extraOptions, fetchWithBQ) {
        const clusterDataDefaultPayload = {
          fields: ['clusterId', 'venueId'],
          pageSize: 10000,
          sortField: 'name',
          sortOrder: 'ASC'
        }

        const clusterListReq = createHttpRequest(EdgeUrlsInfo.getEdgeClusterStatusList, {})
        // eslint-disable-next-line max-len
        const clusterListQuery = await fetchWithBQ({ ...clusterListReq, body: JSON.stringify(clusterDataDefaultPayload) })
        const clusterList = clusterListQuery.data as TableResult<EdgeClusterStatus>

        const results = await Promise.allSettled(clusterList.data?.map(item => {
          return fetchWithBQ(createHttpRequest(
            EdgeTnmServiceUrls.getEdgeOltList,
            { venueId: item.venueId, edgeClusterId: item.clusterId }
          ))
        }))

        const oltList = results.filter(isFulfilled).flatMap(p => p.value.data)

        return {
          data: oltList as EdgeNokiaOltData[]
        }
      },
      providesTags: [{ type: 'EdgeNokiaOlt', id: 'LIST' }]
    }),
    addEdgeOlt: build.mutation<CommonResult, RequestPayload<EdgeNokiaOltCreatePayload>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.addEdgeOlt, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeNokiaOlt', id: 'LIST' }]
    }),
    updateEdgeOlt: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.updateEdgeOlt, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeNokiaOlt', id: 'LIST' }]
    }),
    deleteEdgeOlt: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.deleteEdgeOlt, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'EdgeNokiaOlt', id: 'LIST' }]
    }),
    getEdgeCageList: build.query<EdgeNokiaCageData[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.getEdgeCageList, params)
        return {
          ...req
        }
      },
      transformResponse: (result: EdgeNokiaCageData[]) =>
        result?.map((item) => ({
          ...item,
          // eslint-disable-next-line max-len
          speed: item.state === EdgeNokiaCageStateEnum.UP ? 10 : undefined
        })),
      providesTags: [{ type: 'EdgeNokiaOlt', id: 'CAGE_LIST' }]
    }),
    toggleEdgeCageState: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.toggleEdgeCageState, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeNokiaOlt', id: 'CAGE_LIST' }]
    }),
    getEdgeOnuList: build.query<EdgeNokiaOnuData[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.getEdgeOnuList, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      transformResponse: (result: Omit<EdgeNokiaOnuData, 'portIdx'>[]) =>
        result?.map((item) => ({
          ...item,
          portDetails: item.portDetails.map((port, idx) => ({
            ...port,
            portIdx: `${++idx}`,
            // eslint-disable-next-line max-len
            clientCount: port.status === EdgeNokiaCageStateEnum.UP ? Math.floor(Math.random() * 10) : undefined
          }))
        })),
      providesTags: [{ type: 'EdgeNokiaOlt', id: 'ONU_LIST' }]
    }),
    setEdgeOnuPortVlan: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.setEdgeOnuPortVlan, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeNokiaOlt', id: 'ONU_LIST' }]
    })
  })
})

export const {
  useGetEdgeTnmServiceListQuery,
  useAddEdgeTnmServiceMutation,
  useDeleteEdgeTnmServiceMutation,
  useCreateEdgeTnmHostMutation,
  useGetEdgeTnmHostListQuery,
  useUpdateEdgeTnmHostMutation,
  useDeleteEdgeTnmHostMutation,
  useGetEdgeTnmHostGraphsConfigQuery,
  useGetEdgeTnmHostGroupListQuery,
  useGetEdgeTnmGraphItemsQuery,
  useGetEdgeTnmGraphItemsInfoQuery,
  useGetEdgeTnmGraphHistoryQuery,
  useGetEdgeOltListQuery,
  useLazyGetEdgeOltListQuery,
  useAddEdgeOltMutation,
  useUpdateEdgeOltMutation,
  useDeleteEdgeOltMutation,
  useGetEdgeCageListQuery,
  useToggleEdgeCageStateMutation,
  useGetEdgeOnuListQuery,
  useSetEdgeOnuPortVlanMutation
} = edgeTnmServiceApi