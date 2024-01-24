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
  EdgeSdLanSettingP2,
  EdgeSdLanActivateNetworkPayload
} from '@acx-ui/rc/utils'
import { baseEdgeSdLanApi }  from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { serviceApi } from './service'

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
        providesTags: [{ type: 'EdgeSdLan', id: 'LIST_P2' }],
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
                { type: 'EdgeSdLan', id: 'LIST_P2' }
              ]))
            })
          })
        },
        extraOptions: { maxRetries: 5 }
      }),
    getEdgeSdLanP2: build.query<EdgeSdLanSettingP2, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const cfRequest = createHttpRequest(
          EdgeSdLanUrls.getEdgeSdLan, arg.params)
        const cfQuery = await fetchWithBQ(cfRequest)
        const cfConfig = cfQuery.data as EdgeSdLanSettingP2

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
          ? { data: {
            id: 'mocked_sdLan_id',
            name: 'mockedSdLanData',
            venueId: 'cd572eda8d494a79aa2331fdc26086d9',
            venueName: 'AMY_VENUE',
            edgeId: '965F472F5BB50911EE875D000C290DDC7A',
            networkIds: ['670a1316306242049cf41e350138cb36', '3c44c926a1324955b6de70fd19368213'],
            tunnelProfileId: '3885120d5c7140afbb22842f87fdd1ea',
            corePortMac: 'port1',
            isGuestTunnelEnabled: true,
            guestEdgeId: '961346F1DF760D11E8A08C000C29E61518',
            guestTunnelProfileId: '7426fd7f8ed549baa326f0e6616fc294',
            guestNetworkIds: ['3c44c926a1324955b6de70fd19368213']
          } }
          : { error: cfQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'EdgeSdLan', id: 'DETAIL_P2' }]
    }),
    addEdgeSdLanP2: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.addEdgeSdLan, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeSdLan', id: 'LIST_P2' }],
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
        const req = createHttpRequest(EdgeSdLanUrls.updateEdgeSdLanPartial, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeSdLan', id: 'LIST_P2' }],
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
        return { ...createHttpRequest(EdgeSdLanUrls.activateEdgeSdLanDmzCluster, params) }
      }
    }),
    deactivateEdgeSdLanDmzCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return { ...createHttpRequest(EdgeSdLanUrls.deactivateEdgeSdLanDmzCluster, params) }
      }
    }),
    activateEdgeSdLanDmzTunnelProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return { ...createHttpRequest(EdgeSdLanUrls.activateEdgeSdLanDmzTunnelProfile, params) }
      }
    }),
    deactivateEdgeSdLanDmzTunnelProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return { ...createHttpRequest(EdgeSdLanUrls.deactivateEdgeSdLanDmzTunnelProfile, params) }
      }
    }),
    // eslint-disable-next-line max-len
    activateEdgeSdLanNetwork: build.mutation<CommonResult, RequestPayload<EdgeSdLanActivateNetworkPayload>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.activateEdgeSdLanNetwork, params)
        return { ...req, body: payload }
      }
    }),
    deactivateEdgeSdLanNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.deactivateEdgeSdLanNetwork, params)
        return { ...req, body: payload }
      }
    })
  })
})

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
  useDeactivateEdgeSdLanNetworkMutation
} = edgeSdLanApi