
import {
  CommonResult,
  EdgeHqosConfig,
  EdgeHqosProfilesUrls,
  EdgeHqosViewData,
  onActivityMessageReceived,
  onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseEdgeHqosProfilesApi } from '@acx-ui/store'
import { RequestPayload }          from '@acx-ui/types'
import { TableResult, createHttpRequest }       from '@acx-ui/utils'

import { serviceApi }                     from './service'
import { handleCallbackWhenActivityDone } from './utils'

enum EdgeHqosActivityEnum {
  ADD = 'Create HQoS',
  UPDATE = 'Update HQoS',
  DELETE = 'Delete HQoS',
  ACTIVATE = 'Activate HQoS',
  DEACTIVATE = 'Deactivate HQoS',
}

export const edgeHqosProfilesApi = baseEdgeHqosProfilesApi.injectEndpoints({
  endpoints: (build) => ({
    createEdgeHqosProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeHqosProfilesUrls.addEdgeHqosProfile, undefined)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeHqosProfiles', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: EdgeHqosActivityEnum.ADD,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    deleteEdgeHqosProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeHqosProfilesUrls.deleteEdgeHqosProfile, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'EdgeHqosProfiles', id: 'LIST' }]
    }),
    updateEdgeHqosProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          EdgeHqosProfilesUrls.updateEdgeHqosProfile,
          params
        )
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeHqosProfiles', id: 'LIST' }]
    }),
    getEdgeHqosProfileById: build.query<EdgeHqosConfig, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeHqosProfilesUrls.getEdgeHqosProfileById, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeHqosProfiles', id: 'DETAIL' }]
    }),
    getEdgeHqosProfileViewDataList: build.query<TableResult<EdgeHqosViewData>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeHqosProfiles', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            EdgeHqosActivityEnum.ADD,
            EdgeHqosActivityEnum.UPDATE,
            EdgeHqosActivityEnum.DELETE,
            EdgeHqosActivityEnum.ACTIVATE,
            EdgeHqosActivityEnum.DEACTIVATE
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' }
            ]))
            api.dispatch(edgeHqosProfilesApi.util.invalidateTags([
              { type: 'EdgeHqosProfiles', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    activateHqosOnEdgeCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(EdgeHqosProfilesUrls.activateEdgeCluster, params)
        }
      }
    }),
    deactivateHqosOnEdgeCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(EdgeHqosProfilesUrls.deactivateEdgeCluster, params)
        }
      }
    })
  })
})

export const {
  useGetEdgeHqosProfileViewDataListQuery,
  useGetEdgeHqosProfileByIdQuery,
  useCreateEdgeHqosProfileMutation,
  useDeleteEdgeHqosProfileMutation,
  useUpdateEdgeHqosProfileMutation,
  useActivateHqosOnEdgeClusterMutation,
  useDeactivateHqosOnEdgeClusterMutation
} = edgeHqosProfilesApi
