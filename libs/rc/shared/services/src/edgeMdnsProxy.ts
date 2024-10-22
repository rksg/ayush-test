import {
  TableResult,
  CommonResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  EdgeMdnsProxyUrls,
  EdgeMdnsProxySetting,
  EdgeMdnsProxyViewData
} from '@acx-ui/rc/utils'
import { baseEdgeMdnsProxyApi } from '@acx-ui/store'
import { RequestPayload }       from '@acx-ui/types'
import { createHttpRequest }    from '@acx-ui/utils'

import { serviceApi } from './service'

// TODO: still need to confirm
enum EdgeMdnsProxyActivityEnum {
  ADD = 'Add EdgeMdnsProxy',
  UPDATE = 'Update EdgeMdnsProxy',
  DELETE = 'Delete EdgeMdnsProxy',
  ACTIVATE_NETWORK = 'Activate cluster',
  DEACTIVATE_NETWORK = 'Deactivate cluster',
}

export const edgeMdnsProxyApi = baseEdgeMdnsProxyApi.injectEndpoints({
  endpoints: (build) => ({
    getEdgeMdnsProxyViewDataList:
      build.query<TableResult<EdgeMdnsProxyViewData>, RequestPayload>({
        query: ({ payload }) => {
          const req = createHttpRequest(EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList)
          return {
            ...req,
            body: JSON.stringify(payload)
          }
        },
        providesTags: [{ type: 'EdgeMdnsProxy', id: 'LIST' }],
        async onCacheEntryAdded (requestArgs, api) {
          await onSocketActivityChanged(requestArgs, api, (msg) => {
            onActivityMessageReceived(msg, [
              EdgeMdnsProxyActivityEnum.ADD,
              EdgeMdnsProxyActivityEnum.UPDATE,
              EdgeMdnsProxyActivityEnum.DELETE
            ], () => {
              api.dispatch(serviceApi.util.invalidateTags([
                { type: 'Service', id: 'LIST' }
              ]))
              api.dispatch(edgeMdnsProxyApi.util.invalidateTags([
                { type: 'EdgeMdnsProxy', id: 'LIST' }
              ]))
            })
          })
        },
        extraOptions: { maxRetries: 5 }
      }),
    getEdgeMdnsProxy: build.query<EdgeMdnsProxySetting, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeMdnsProxyUrls.getEdgeMdnsProxy, params)
      },
      providesTags: [{ type: 'EdgeMdnsProxy', id: 'DETAIL' }]
    }),
    addEdgeMdnsProxy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeMdnsProxyUrls.addEdgeMdnsProxy, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeMdnsProxy', id: 'LIST' }]
    }),
    updateEdgeMdnsProxy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeMdnsProxyUrls.updateEdgeMdnsProxy, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeMdnsProxy', id: 'LIST' }]
    }),
    deleteEdgeMdnsProxy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        //delete single row
        return createHttpRequest(EdgeMdnsProxyUrls.deleteEdgeMdnsProxy, params)
      },
      invalidatesTags: [{ type: 'EdgeMdnsProxy', id: 'LIST' }]
    }),
    activateEdgeMdnsProxyCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeMdnsProxyUrls.activateEdgeMdnsProxyCluster, params)
      }
    }),
    deactivateEdgeMdnsProxyCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeMdnsProxyUrls.deactivateEdgeMdnsProxyCluster, params)
      }
    })
  })
})

export const {
  useGetEdgeMdnsProxyViewDataListQuery,
  useGetEdgeMdnsProxyQuery,
  useAddEdgeMdnsProxyMutation,
  useUpdateEdgeMdnsProxyMutation,
  useDeleteEdgeMdnsProxyMutation,
  useActivateEdgeMdnsProxyClusterMutation,
  useDeactivateEdgeMdnsProxyClusterMutation
} = edgeMdnsProxyApi