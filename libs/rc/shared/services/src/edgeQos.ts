import {
  CommonResult,
  EdgeQosConfig,
  EdgeQosUrls,
  EdgeQosViewData,
  TableResult,
  onActivityMessageReceived,
  onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseEdgeQosApi }                      from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

import { serviceApi } from './service'


export const edgeQosApi = baseEdgeQosApi.injectEndpoints({
  endpoints: (build) => ({
    createEdgeQos: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeQosUrls.createEdgeQos, undefined, {
          ...ignoreErrorModal
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeQos', id: 'LIST' }]
    }),
    deleteEdgeQos: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeQosUrls.deleteEdgeQos, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'EdgeQos', id: 'LIST' }]
    }),
    updateEdgeQos: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          EdgeQosUrls.updateEdgeQos,
          params,
          {
            ...ignoreErrorModal
          }
        )
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeQos', id: 'LIST' }]
    }),
    getEdgeQosById: build.query<EdgeQosConfig, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeQosUrls.getEdgeQosById, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeQos', id: 'DETAIL' }]
    }),
    getEdgeQosViewDataList: build.query<TableResult<EdgeQosViewData>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeQosUrls.getEdgeQosViewDataList)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeQos', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Add Edge Qos',
            'Update Edge Qos',
            'Delete Edge Qos'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' }
            ]))
            api.dispatch(edgeQosApi.util.invalidateTags([
              { type: 'EdgeQos', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    })

  })
})

export const {
  useGetEdgeQosViewDataListQuery,
  useGetEdgeQosByIdQuery,
  useCreateEdgeQosMutation,
  useDeleteEdgeQosMutation,
  useUpdateEdgeQosMutation
} = edgeQosApi