import {
  TableResult,
  CommonResult,
  EdgeTnmServiceUrls,
  EdgeTnmServiceSetting,
  EdgeTnmServiceViewData
} from '@acx-ui/rc/utils'
import { baseEdgeTnmServiceApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'

export const edgeTnmServiceApi = baseEdgeTnmServiceApi.injectEndpoints({
  endpoints: (build) => ({
    getEdgeTnmServiceViewDataList:
      build.query<TableResult<EdgeTnmServiceViewData>, RequestPayload>({
        query: ({ payload }) => {
          const req = createHttpRequest(EdgeTnmServiceUrls.getEdgeTnmServiceViewDataList)
          return {
            ...req,
            body: JSON.stringify(payload)
          }
        },
        providesTags: [{ type: 'EdgeTnmService', id: 'LIST' }],
        extraOptions: { maxRetries: 5 }
      }),
    getEdgeTnmService: build.query<EdgeTnmServiceSetting, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeTnmServiceUrls.getEdgeTnmService, params)
      },
      providesTags: [{ type: 'EdgeTnmService', id: 'DETAIL' }]
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
    })
  })
})

export const {
  useGetEdgeTnmServiceViewDataListQuery,
  useGetEdgeTnmServiceQuery,
  useAddEdgeTnmServiceMutation,
  useDeleteEdgeTnmServiceMutation
} = edgeTnmServiceApi