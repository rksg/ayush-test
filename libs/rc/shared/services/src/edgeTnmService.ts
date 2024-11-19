import {
  CommonResult,
  EdgeTnmServiceUrls,
  EdgeTnmServiceData,
  EdgeTnmHostSetting,
  EdgeTnmHostGraphConfig,
  EdgeTnmHostGroup,
  EdgeTnmGraphItem,
  EdgeTnmGraphItemInfo,
  EdgeTnmGraphHistory
} from '@acx-ui/rc/utils'
import { baseEdgeTnmServiceApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'

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
  useGetEdgeTnmGraphHistoryQuery
} = edgeTnmServiceApi