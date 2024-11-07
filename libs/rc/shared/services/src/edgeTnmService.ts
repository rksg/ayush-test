import {
  CommonResult,
  EdgeTnmServiceUrls,
  EdgeTnmServiceData,
  EdgeTnmHostSetting,
  EdgeTnmHostGraphConfig,
  EdgeTnmHostGroup
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
        providesTags: [{ type: 'EdgeTnmService', id: 'LIST' }],
        extraOptions: { maxRetries: 5 }
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
      },
      extraOptions: { maxRetries: 5 }
    }),
    getEdgeTnmHostGroupList: build.query<EdgeTnmHostGroup[], RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeTnmServiceUrls.getEdgeTnmHostGroupList, params)
      },
      extraOptions: { maxRetries: 5 }
    }),
    getEdgeTnmHostList: build.query<EdgeTnmHostSetting[], RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeTnmServiceUrls.getEdgeTnmHostList, params)
      },
      extraOptions: { maxRetries: 5 }
    }),
    createEdgeTnmHost: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.createEdgeTnmHost, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    updateEdgeTnmHost: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeTnmServiceUrls.updateEdgeTnmHost, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    deleteEdgeTnmHost: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeTnmServiceUrls.deleteEdgeTnmHost, params)
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
  useGetEdgeTnmHostGroupListQuery
} = edgeTnmServiceApi