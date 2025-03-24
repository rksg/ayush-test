import { CommonResult, onActivityMessageReceived, onSocketActivityChanged, TableResult, TunnelProfile, TunnelProfileUrls, TunnelProfileViewData } from '@acx-ui/rc/utils'
import { baseTunnelProfileApi }                                                                                                                   from '@acx-ui/store'
import { RequestPayload }                                                                                                                         from '@acx-ui/types'
import { createHttpRequest }                                                                                                                      from '@acx-ui/utils'

import { handleCallbackWhenActivityDone } from './utils'

enum TunnelProfileActivityEnum {
  ADD = 'AddTunnelServiceProfile',
  UPDATE = 'UpdateTunnelServiceProfile',
  DELETE = 'DeleteTunnelServiceProfile',
}

export const tunnelProfileApi = baseTunnelProfileApi.injectEndpoints({
  endpoints: (build) => ({
    createTunnelProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(TunnelProfileUrls.createTunnelProfile)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'TunnelProfile', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: TunnelProfileActivityEnum.ADD,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    getTunnelProfileViewDataList: build.query<TableResult<TunnelProfileViewData>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(TunnelProfileUrls.getTunnelProfileViewDataList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'TunnelProfile', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddTunnelServiceProfile',
            'UpdateTunnelServiceProfile',
            'DeleteTunnelServiceProfile',
            'DeleteTunnelServiceProfiles'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(
              tunnelProfileApi.util.invalidateTags([
                { type: 'TunnelProfile', id: 'LIST' }
              ])
            )
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    deleteTunnelProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(TunnelProfileUrls.deleteTunnelProfile, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'TunnelProfile', id: 'LIST' }]
    }),
    getTunnelProfileById: build.query<TunnelProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(TunnelProfileUrls.getTunnelProfile, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'TunnelProfile', id: 'DETAIL' }]
    }),
    updateTunnelProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(TunnelProfileUrls.updateTunnelProfile, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'TunnelProfile', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: TunnelProfileActivityEnum.UPDATE,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    activateTunnelProfileByEdgeCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(TunnelProfileUrls.activateTunnelProfileByEdgeCluster, params)
        }
      }
    }),
    deactivateTunnelProfileByEdgeCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(TunnelProfileUrls.deactivateTunnelProfileByEdgeCluster, params)
        }
      }
    })
  })
})

export const {
  useCreateTunnelProfileMutation,
  useGetTunnelProfileViewDataListQuery,
  useDeleteTunnelProfileMutation,
  useGetTunnelProfileByIdQuery,
  useUpdateTunnelProfileMutation,
  useActivateTunnelProfileByEdgeClusterMutation,
  useDeactivateTunnelProfileByEdgeClusterMutation
} = tunnelProfileApi