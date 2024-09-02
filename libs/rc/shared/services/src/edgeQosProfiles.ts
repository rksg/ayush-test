
import {
  CommonResult,
  EdgeQosConfig,
  EdgeQosProfilesUrls,
  EdgeQosViewData,
  TableResult,
  onActivityMessageReceived,
  onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseEdgeQosProfilesApi } from '@acx-ui/store'
import { RequestPayload }         from '@acx-ui/types'
import { createHttpRequest }      from '@acx-ui/utils'

import { serviceApi } from './service'


export const edgeQosProfilesApi = baseEdgeQosProfilesApi.injectEndpoints({
  endpoints: (build) => ({
    createEdgeQosProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeQosProfilesUrls.addEdgeQosProfile, undefined)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeQosProfiles', id: 'LIST' }]
    }),
    deleteEdgeQosProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeQosProfilesUrls.deleteEdgeQosProfile, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'EdgeQosProfiles', id: 'LIST' }]
    }),
    updateEdgeQosProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          EdgeQosProfilesUrls.updateEdgeQosProfile,
          params
        )
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeQosProfiles', id: 'LIST' }]
    }),
    getEdgeQosProfileById: build.query<EdgeQosConfig, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeQosProfilesUrls.getEdgeQosProfileById, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeQosProfiles', id: 'DETAIL' }]
    }),
    getEdgeQosProfileViewDataList: build.query<TableResult<EdgeQosViewData>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeQosProfilesUrls.getEdgeQosProfileViewDataList)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeQosProfiles', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Create HQoS',
            'Update HQoS',
            'Delete HQoS',
            'Activate HQoS',
            'Deactivate HQoS'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' }
            ]))
            api.dispatch(edgeQosProfilesApi.util.invalidateTags([
              { type: 'EdgeQosProfiles', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    activateQosOnEdgeCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(EdgeQosProfilesUrls.activateEdgeCluster, params)
        }
      }
    }),
    deactivateQosOnEdgeCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(EdgeQosProfilesUrls.deactivateEdgeCluster, params)
        }
      }
    })
  })
})

export const {
  useGetEdgeQosProfileViewDataListQuery,
  useGetEdgeQosProfileByIdQuery,
  useCreateEdgeQosProfileMutation,
  useDeleteEdgeQosProfileMutation,
  useUpdateEdgeQosProfileMutation,
  useActivateQosOnEdgeClusterMutation,
  useDeactivateQosOnEdgeClusterMutation
} = edgeQosProfilesApi