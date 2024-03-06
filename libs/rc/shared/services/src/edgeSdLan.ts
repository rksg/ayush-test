import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query/react'

import {
  TableResult,
  CommonResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  NewAPITableResult,
  transferNewResToTableResult,
  EdgeSdLanUrls,
  EdgeSdLanSetting,
  EdgeSdLanViewData,
  EdgeUrlsInfo,
  EdgeStatus,
  EdgeSdLanViewDataP2,
  EdgeSdLanActivateNetworkPayload,
  EdgeSdLanToggleDmzPayload,
  EdgeSdLanSettingP2,
  EdgeClusterStatus
} from '@acx-ui/rc/utils'
import { baseEdgeSdLanApi }  from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { serviceApi } from './service'

const versionHeader = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}

export const edgeSdLanApi = baseEdgeSdLanApi.injectEndpoints({
  endpoints: (build) => ({
    getEdgeSdLanList:
      build.query<TableResult<EdgeSdLanSetting>, RequestPayload>({
        query: ({ params }) => {
          const req = createHttpRequest(EdgeSdLanUrls.getEdgeSdLanList, params)
          return {
            ...req
          }
        },
        providesTags: [{ type: 'EdgeSdLan', id: 'LIST' }],
        transformResponse: (result: NewAPITableResult<EdgeSdLanSetting>) => {
          return transferNewResToTableResult<EdgeSdLanSetting>(result)
        },
        async onCacheEntryAdded (requestArgs, api) {
          await onSocketActivityChanged(requestArgs, api, (msg) => {
            onActivityMessageReceived(msg, [
              'Add SD-LAN',
              'Update SD-LAN',
              'Delete SD-LAN'
            ], () => {
              api.dispatch(serviceApi.util.invalidateTags([
                { type: 'Service', id: 'LIST' }
              ]))
              api.dispatch(edgeSdLanApi.util.invalidateTags([
                { type: 'EdgeSdLan', id: 'LIST' }
              ]))
            })
          })
        }
      }),
    getEdgeSdLan: build.query<EdgeSdLanSetting, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const cfRequest = createHttpRequest(
          EdgeSdLanUrls.getEdgeSdLan, arg.params)
        const cfQuery = await fetchWithBQ(cfRequest)
        const cfConfig = cfQuery.data as EdgeSdLanSetting

        const edgeRequest = createHttpRequest(EdgeUrlsInfo.getEdgeList)
        const edgeQuery = await fetchWithBQ({
          ...edgeRequest,
          body: {
            fields: [
              'name',
              'serialNumber',
              'venueId',
              'venueName'
            ],
            filters: {
              serialNumber: [cfConfig.edgeId]
            }
          }
        })

        const edgeInfo = edgeQuery.data as TableResult<EdgeStatus>
        cfConfig.venueId = edgeInfo.data[0].venueId
        cfConfig.venueName = edgeInfo.data[0].venueName

        return cfQuery.data
          ? { data: cfConfig }
          : { error: cfQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'EdgeSdLan', id: 'DETAIL' }]
    }),
    addEdgeSdLan: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.addEdgeSdLan, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeSdLan', id: 'LIST' }]
    }),
    updateEdgeSdLan: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.updateEdgeSdLan, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeSdLan', id: 'LIST' }]
    }),
    updateEdgeSdLanPartial: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.updateEdgeSdLanPartial, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeSdLan', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded

            if (response && msg.useCase === 'Update SD-LAN'
                && msg.steps?.find((step) =>
                  (step.id === 'Update SD-LAN'))?.status !== 'IN_PROGRESS') {
              (requestArgs.callback as Function)(response.data)
            }
          } catch {
          }
        })
      }
    }),
    getEdgeSdLanViewDataList:
      build.query<TableResult<EdgeSdLanViewData>, RequestPayload>({
        query: ({ payload }) => {
          const req = createHttpRequest(EdgeSdLanUrls.getEdgeSdLanViewDataList)
          return {
            ...req,
            body: payload
          }
        },
        providesTags: [{ type: 'EdgeSdLan', id: 'LIST' }],
        async onCacheEntryAdded (requestArgs, api) {
          await onSocketActivityChanged(requestArgs, api, (msg) => {
            onActivityMessageReceived(msg, [
              'Add SD-LAN',
              'Update SD-LAN',
              'Delete SD-LAN'
            ], () => {
              api.dispatch(serviceApi.util.invalidateTags([
                { type: 'Service', id: 'LIST' }
              ]))
              api.dispatch(edgeSdLanApi.util.invalidateTags([
                { type: 'EdgeSdLan', id: 'LIST' }
              ]))
            })
          })
        },
        extraOptions: { maxRetries: 5 }
      }),
    deleteEdgeSdLan: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        //delete single row
        const req = createHttpRequest(EdgeSdLanUrls.deleteEdgeSdLan, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'EdgeSdLan', id: 'LIST' }]
    }),
    getEdgeSdLanP2ViewDataList:
      build.query<TableResult<EdgeSdLanViewDataP2>, RequestPayload>({
        query: ({ payload }) => {
          const req = createHttpRequest(EdgeSdLanUrls.getEdgeSdLanViewDataList)
          return {
            ...req,
            body: payload
          }
        },
        providesTags: [{ type: 'EdgeSdLanP2', id: 'LIST' }],
        async onCacheEntryAdded (requestArgs, api) {
          await onSocketActivityChanged(requestArgs, api, (msg) => {
            onActivityMessageReceived(msg, [
              'Add SD-LAN',
              'Update SD-LAN',
              'Delete SD-LAN'
            ], () => {
              api.dispatch(serviceApi.util.invalidateTags([
                { type: 'Service', id: 'LIST' }
              ]))
              api.dispatch(edgeSdLanApi.util.invalidateTags([
                { type: 'EdgeSdLanP2', id: 'LIST' }
              ]))
            })
          })
        },
        extraOptions: { maxRetries: 5 }
      }),
    getEdgeSdLanP2: build.query<EdgeSdLanSettingP2, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetchWithBQ) {
        const sdLanRequest = createHttpRequest(
          EdgeSdLanUrls.getEdgeSdLan, params, versionHeader)
        const sdLanQuery = await fetchWithBQ(sdLanRequest)
        const sdLanConfig = sdLanQuery.data as EdgeSdLanSettingP2

        if (sdLanConfig) {
          const guestSettingsReq = createHttpRequest(EdgeSdLanUrls.getEdgeSdLanIsDmz,
            params,
            versionHeader)
          const edgeGuestSettingQuery = await fetchWithBQ(guestSettingsReq)

          const sdLanStatusReq = createHttpRequest(EdgeSdLanUrls.getEdgeSdLanViewDataList)
          const sdLanStatusQuery = await fetchWithBQ({
            ...sdLanStatusReq,
            body: {
              filters: { id: [params!.serviceId] }
            }
          })

          const clusterReq = createHttpRequest(EdgeUrlsInfo.getEdgeClusterStatusList)
          const edgeClusterQuery = await fetchWithBQ({
            ...clusterReq,
            body: {
              fields: [
                'name',
                'clusterId',
                'venueId',
                'venueName'
              ],
              filters: { clusterId: [sdLanConfig.edgeClusterId] }
            }
          })

          const sdLanInfo = sdLanStatusQuery.data as TableResult<EdgeSdLanViewDataP2>
          const guestSettings = edgeGuestSettingQuery.data as EdgeSdLanToggleDmzPayload
          const clusterInfo = edgeClusterQuery.data as TableResult<EdgeClusterStatus>
          // eslint-disable-next-line max-len
          const sdLanData = transformSdLanGetData(sdLanConfig, sdLanInfo.data?.[0], clusterInfo.data[0], guestSettings)

          return (sdLanInfo && guestSettings && clusterInfo)
            ? { data: sdLanData }
            : { error: (sdLanStatusQuery.error
              || edgeGuestSettingQuery.error
              || edgeClusterQuery.data) as FetchBaseQueryError }
        } else {
          return { error: sdLanQuery.error as FetchBaseQueryError }
        }
      },
      providesTags: [{ type: 'EdgeSdLanP2', id: 'DETAIL' }]
    }),
    addEdgeSdLanP2: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.addEdgeSdLan, params, versionHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeSdLanP2', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded

            if (response && msg.useCase === 'Add SD-LAN'
                && msg.steps?.find((step) =>
                  (step.id === 'Add SD-LAN'))?.status !== 'IN_PROGRESS') {
              (requestArgs.callback as Function)(response.data)
            }
          } catch {
          }
        })
      }
    }),
    updateEdgeSdLanPartialP2: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.updateEdgeSdLanPartial, params, versionHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeSdLanP2', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded
            if (response && msg.useCase === 'Update SD-LAN'
                && msg.steps?.find((step) =>
                  (step.id === 'Update SD-LAN'))?.status !== 'IN_PROGRESS') {
              (requestArgs.callback as Function)(response.data)
            }
          } catch {
          }
        })
      }
    }),
    activateEdgeSdLanDmzCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(EdgeSdLanUrls.activateEdgeSdLanDmzCluster,
            params,
            versionHeader)
        }
      }
    }),
    deactivateEdgeSdLanDmzCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(EdgeSdLanUrls.deactivateEdgeSdLanDmzCluster,
            params,
            versionHeader)
        }
      }
    }),
    activateEdgeSdLanDmzTunnelProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(EdgeSdLanUrls.activateEdgeSdLanDmzTunnelProfile,
            params,
            versionHeader)
        }
      }
    }),
    deactivateEdgeSdLanDmzTunnelProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(EdgeSdLanUrls.deactivateEdgeSdLanDmzTunnelProfile,
            params,
            versionHeader)
        }
      }
    }),
    // eslint-disable-next-line max-len
    activateEdgeSdLanNetwork: build.mutation<CommonResult, RequestPayload<EdgeSdLanActivateNetworkPayload>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.activateEdgeSdLanNetwork, params, versionHeader)
        return { ...req, body: JSON.stringify(payload) }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded
            if (response && msg.useCase === 'Activate network'
                && msg.steps?.find((step) =>
                  (step.id === 'Activate network'))?.status !== 'IN_PROGRESS') {
              (requestArgs.callback as Function)(response.data)
            }
          } catch {
          }
        })
      }
    }),
    deactivateEdgeSdLanNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeSdLanUrls.deactivateEdgeSdLanNetwork,
          params,
          versionHeader)
        return { ...req }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded
            if (response && msg.useCase === 'Deactivate network'
                && msg.steps?.find((step) =>
                  (step.id === 'Deactivate network'))?.status !== 'IN_PROGRESS') {
              (requestArgs.callback as Function)(response.data)
            }
          } catch {
          }
        })
      }
    }),
    toggleEdgeSdLanDmz: build.mutation<CommonResult, RequestPayload<EdgeSdLanToggleDmzPayload>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.toggleEdgeSdLanDmz, params, versionHeader)
        return { ...req, body: JSON.stringify(payload) }
      }
    }),
    getEdgeSdLanIsDmz: build.query<EdgeSdLanToggleDmzPayload, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeSdLanUrls.getEdgeSdLanIsDmz, params, versionHeader)
        return { ...req }
      }
    })
  })
})

const transformSdLanGetData = (
  profile: EdgeSdLanSettingP2,
  statusData: EdgeSdLanViewDataP2,
  clusterInfo: EdgeClusterStatus,
  guestSettings: EdgeSdLanToggleDmzPayload
): EdgeSdLanSettingP2 => {
  profile.venueId = clusterInfo.venueId
  profile.venueName = clusterInfo.venueName
  profile.isGuestTunnelEnabled = guestSettings.isGuestTunnelEnabled
  return {
    ...profile,
    networkIds: statusData.networkIds,
    guestEdgeClusterId: statusData.guestEdgeClusterId,
    guestTunnelProfileId: statusData.guestTunnelProfileId,
    guestNetworkIds: statusData.guestNetworkIds
  }
}

export const {
  useGetEdgeSdLanListQuery,
  useGetEdgeSdLanQuery,
  useGetEdgeSdLanViewDataListQuery,
  useAddEdgeSdLanMutation,
  useUpdateEdgeSdLanMutation,
  useUpdateEdgeSdLanPartialMutation,
  useDeleteEdgeSdLanMutation,
  useGetEdgeSdLanP2ViewDataListQuery,
  useGetEdgeSdLanP2Query,
  useAddEdgeSdLanP2Mutation,
  useUpdateEdgeSdLanPartialP2Mutation,
  useActivateEdgeSdLanDmzClusterMutation,
  useDeactivateEdgeSdLanDmzClusterMutation,
  useActivateEdgeSdLanDmzTunnelProfileMutation,
  useDeactivateEdgeSdLanDmzTunnelProfileMutation,
  useActivateEdgeSdLanNetworkMutation,
  useDeactivateEdgeSdLanNetworkMutation,
  useGetEdgeSdLanIsDmzQuery,
  useToggleEdgeSdLanDmzMutation
} = edgeSdLanApi