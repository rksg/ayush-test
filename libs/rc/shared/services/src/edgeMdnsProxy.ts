import {
  TableResult,
  CommonResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  EdgeMdnsProxyUrls,
  EdgeMdnsProxySetting,
  EdgeMdnsProxyViewData,
  EdgeMdnsProxyStatsData
} from '@acx-ui/rc/utils'
import { baseEdgeMdnsProxyApi } from '@acx-ui/store'
import { RequestPayload }       from '@acx-ui/types'
import { createHttpRequest }    from '@acx-ui/utils'

import { serviceApi }                     from './service'
import { handleCallbackWhenActivityDone } from './utils'

enum EdgeMdnsProxyActivityEnum {
  CREATE = 'Create MdnsProxy',
  UPDATE = 'Update MdnsProxy',
  DELETE = 'Delete MdnsProxy',
  ACTIVATE_CLUSTER = 'Activate MdnsProxy',
  DEACTIVATE_CLUSTER = 'Deactivate MdnsProxy',
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
              EdgeMdnsProxyActivityEnum.CREATE,
              EdgeMdnsProxyActivityEnum.UPDATE,
              EdgeMdnsProxyActivityEnum.DELETE,
              EdgeMdnsProxyActivityEnum.ACTIVATE_CLUSTER,
              EdgeMdnsProxyActivityEnum.DEACTIVATE_CLUSTER
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
      invalidatesTags: [{ type: 'EdgeMdnsProxy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: EdgeMdnsProxyActivityEnum.CREATE,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
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
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: EdgeMdnsProxyActivityEnum.ACTIVATE_CLUSTER,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    deactivateEdgeMdnsProxyCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeMdnsProxyUrls.deactivateEdgeMdnsProxyCluster, params)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: EdgeMdnsProxyActivityEnum.DEACTIVATE_CLUSTER,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    getEdgeMdnsProxyStatsList:
      build.query<TableResult<EdgeMdnsProxyStatsData>, RequestPayload>({
        query: ({ payload }) => {
          const req = createHttpRequest(EdgeMdnsProxyUrls.getEdgeMdnsProxyStatsList)
          return {
            ...req,
            body: JSON.stringify(payload)
          }
        },
        extraOptions: { maxRetries: 5 }
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
  useDeactivateEdgeMdnsProxyClusterMutation,
  useGetEdgeMdnsProxyStatsListQuery
} = edgeMdnsProxyApi