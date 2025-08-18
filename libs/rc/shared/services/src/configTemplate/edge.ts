/* eslint-disable max-len */
import { CommonResult, EdgeConfigTemplateUrlsInfo, onSocketActivityChanged, TunnelProfile, TunnelProfileViewData } from '@acx-ui/rc/utils'
import { baseConfigTemplateApi }                                                                                   from '@acx-ui/store'
import { RequestPayload }                                                                                          from '@acx-ui/types'
import { createHttpRequest, TableResult }                                                                          from '@acx-ui/utils'

import { commonQueryFn }                  from '../servicePolicy.utils'
import { handleCallbackWhenActivityDone } from '../utils'

export const EdgeConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    activateSdLanNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(EdgeConfigTemplateUrlsInfo.activateSdLanNetworkTemplate),
      invalidatesTags: [{ type: 'EdgeSdLanTemplate', id: 'LIST' }]
    }),
    deactivateSdLanNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(EdgeConfigTemplateUrlsInfo.deactivateSdLanNetworkTemplate),
      invalidatesTags: [{ type: 'EdgeSdLanTemplate', id: 'LIST' }]
    }),
    createTunnelProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeConfigTemplateUrlsInfo.addTunnelProfileTemplate, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'TunnelProfileTemplate', id: 'LIST' }, { type: 'ConfigTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: 'AddTunnelServiceProfileTemplate',
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    getTunnelProfileTemplate: build.query<TunnelProfile, RequestPayload>({
      query: commonQueryFn(EdgeConfigTemplateUrlsInfo.getTunnelProfileTemplate),
      providesTags: [{ type: 'TunnelProfileTemplate', id: 'DETAIL' }]
    }),
    updateTunnelProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeConfigTemplateUrlsInfo.updateTunnelProfileTemplate, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'TunnelProfileTemplate', id: 'DETAIL' }, { type: 'ConfigTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: 'UpdateTunnelServiceProfile',
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    deleteTunnelProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(EdgeConfigTemplateUrlsInfo.deleteTunnelProfileTemplate, params)
      },
      invalidatesTags: [{ type: 'TunnelProfileTemplate', id: 'LIST' }, { type: 'ConfigTemplate', id: 'LIST' }]
    }),
    getTunnelProfileTemplateViewDataListSkipRecRewrite: build.query<TableResult<TunnelProfileViewData>, RequestPayload>({
      query: commonQueryFn(EdgeConfigTemplateUrlsInfo.getTunnelProfileTemplateViewDataListSkipRecRewrite),
      providesTags: [{ type: 'TunnelProfileTemplate', id: 'DETAIL' }]
    })
  })
})

export const {
  useActivateSdLanNetworkTemplateMutation,
  useDeactivateSdLanNetworkTemplateMutation,
  useCreateTunnelProfileTemplateMutation,
  useGetTunnelProfileTemplateQuery,
  useUpdateTunnelProfileTemplateMutation,
  useDeleteTunnelProfileTemplateMutation,
  useGetTunnelProfileTemplateViewDataListSkipRecRewriteQuery
} = EdgeConfigTemplateApi