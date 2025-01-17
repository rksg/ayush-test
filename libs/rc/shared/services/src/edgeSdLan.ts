import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { groupBy }             from 'lodash'

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
  EdgeClusterStatus,
  TxStatus,
  EdgeMvSdLanExtended,
  EdgeMvSdLanViewData,
  EdgeMvSdLanNetworks,
  EdgeMvSdLanResponseType
} from '@acx-ui/rc/utils'
import { baseEdgeSdLanApi }  from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { serviceApi }                                                        from './service'
import { handleCallbackWhenActivityDone, handleCallbackWhenActivitySuccess } from './utils'

const versionHeader = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}

enum EdgeSdLanActivityEnum {
  ADD = 'Add SD-LAN',
  UPDATE = 'Update SD-LAN',
  DELETE = 'Delete SD-LAN',
  ACTIVATE_NETWORK = 'Activate network',
  DEACTIVATE_NETWORK = 'Deactivate network',
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
              EdgeSdLanActivityEnum.ADD,
              EdgeSdLanActivityEnum.UPDATE,
              EdgeSdLanActivityEnum.DELETE
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
              EdgeSdLanActivityEnum.ADD,
              EdgeSdLanActivityEnum.UPDATE,
              EdgeSdLanActivityEnum.DELETE
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
              EdgeSdLanActivityEnum.ADD,
              EdgeSdLanActivityEnum.UPDATE,
              EdgeSdLanActivityEnum.DELETE,
              EdgeSdLanActivityEnum.ACTIVATE_NETWORK,
              EdgeSdLanActivityEnum.DEACTIVATE_NETWORK,
              'DeleteNetworkVenue',
              'DeactivateWifiNetworkOnVenue'
            ], () => {
              api.dispatch(serviceApi.util.invalidateTags([
                { type: 'Service', id: 'LIST' }
              ]))
              api.dispatch(edgeSdLanApi.util.invalidateTags([
                { type: 'EdgeSdLanP2', id: 'LIST' }, { type: 'EdgeMvSdLan', id: 'LIST' }
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
              fields: [
                'networkIds', 'guestNetworkIds', 'guestEdgeClusterId', 'guestTunnelProfileId'
              ],
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
          let sdLanData = sdLanConfig
          if (sdLanInfo && guestSettings && clusterInfo) {
          // eslint-disable-next-line max-len
            sdLanData = transformSdLanGetData(sdLanConfig, sdLanInfo.data?.[0], clusterInfo.data[0], guestSettings)
          }

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

            // eslint-disable-next-line max-len
            if (response && response.data.requestId === msg.requestId && msg.useCase === 'Add SD-LAN') {
              const status = msg.steps?.find((step) => (step.id === 'Add SD-LAN'))?.status

              if (status === TxStatus.FAIL) {
                (requestArgs.failedCallback as Function)?.(response.data)
              } else if (status === TxStatus.SUCCESS) {
                (requestArgs.callback as Function)?.(response.data)
              }
            }
          } catch {}
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

            // eslint-disable-next-line max-len
            if (response && response.data.requestId === msg.requestId && msg.useCase === 'Update SD-LAN') {
              const status = msg.steps?.find((step) => (step.id === 'Update SD-LAN'))?.status

              if (status === TxStatus.FAIL) {
                (requestArgs.failedCallback as Function)?.(response.data)
              } else if (status === TxStatus.SUCCESS) {
                (requestArgs.callback as Function)?.(response.data)
              }
            }
          } catch {}
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
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: EdgeSdLanActivityEnum.ACTIVATE_NETWORK,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
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
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: EdgeSdLanActivityEnum.DEACTIVATE_NETWORK,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
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
    }),
    // multi-venue SD-LAN
    getEdgeMvSdLanViewDataList:
    build.query<TableResult<EdgeMvSdLanViewData>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.getEdgeSdLanViewDataList)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EdgeMvSdLan', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            EdgeSdLanActivityEnum.ADD,
            EdgeSdLanActivityEnum.UPDATE,
            EdgeSdLanActivityEnum.DELETE,
            EdgeSdLanActivityEnum.ACTIVATE_NETWORK,
            EdgeSdLanActivityEnum.DEACTIVATE_NETWORK,
            'DeleteNetworkVenue',
            'DeactivateWifiNetworkOnVenue'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' }
            ]))
            api.dispatch(edgeSdLanApi.util.invalidateTags([
              { type: 'EdgeMvSdLan', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getEdgeMvSdLan: build.query<EdgeMvSdLanExtended, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetchWithBQ) {
        const sdLanRequest = createHttpRequest(
          EdgeSdLanUrls.getEdgeSdLan, params, versionHeader)
        const sdLanQuery = await fetchWithBQ(sdLanRequest)
        const sdLanConfig = sdLanQuery.data as EdgeMvSdLanResponseType

        if (sdLanConfig) {
          const guestSettingsReq = createHttpRequest(EdgeSdLanUrls.getEdgeSdLanIsDmz,
            params,
            versionHeader)
          const edgeGuestSettingQuery = await fetchWithBQ(guestSettingsReq)

          const sdLanStatusReq = createHttpRequest(EdgeSdLanUrls.getEdgeSdLanViewDataList)
          const sdLanStatusQuery = await fetchWithBQ({
            ...sdLanStatusReq,
            body: {
              fields: [
                'id', 'edgeClusterName',
                'tunnelProfileName', 'isGuestTunnelEnabled',
                'guestEdgeClusterId', 'guestEdgeClusterName',
                'guestTunnelProfileId', 'guestTunnelProfileName',
                'tunneledWlans', 'tunneledGuestWlans'
              ],
              filters: { id: [params!.serviceId] }
            }
          })

          const sdLanInfo = sdLanStatusQuery.data as TableResult<EdgeMvSdLanViewData>
          const guestSettings = edgeGuestSettingQuery.data as EdgeSdLanToggleDmzPayload
          let sdLanData: EdgeMvSdLanExtended = sdLanConfig as EdgeMvSdLanExtended
          if (sdLanInfo && guestSettings) {
          // eslint-disable-next-line max-len
            sdLanData = transformMvSdLanGetData(sdLanConfig, sdLanInfo.data?.[0], guestSettings)
          }

          return (sdLanInfo && guestSettings)
            ? { data: sdLanData }
            : { error: (sdLanStatusQuery.error
              || edgeGuestSettingQuery.error
              ) as FetchBaseQueryError }
        } else {
          return { error: sdLanQuery.error as FetchBaseQueryError }
        }
      },
      providesTags: [{ type: 'EdgeMvSdLan', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            EdgeSdLanActivityEnum.UPDATE,
            EdgeSdLanActivityEnum.DELETE,
            EdgeSdLanActivityEnum.ACTIVATE_NETWORK,
            EdgeSdLanActivityEnum.DEACTIVATE_NETWORK,
            'DeleteNetworkVenue',
            'DeactivateWifiNetworkOnVenue'
          ], () => {
            api.dispatch(edgeSdLanApi.util.invalidateTags([
              { type: 'EdgeMvSdLan', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    addEdgeMvSdLan: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.addEdgeSdLan, params, versionHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeMvSdLan', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: EdgeSdLanActivityEnum.ADD,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    updateEdgeMvSdLanPartial: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EdgeSdLanUrls.updateEdgeSdLanPartial, params, versionHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeMvSdLan', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: EdgeSdLanActivityEnum.UPDATE,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    // eslint-disable-next-line max-len
    activateEdgeMvSdLanNetwork: build.mutation<CommonResult, RequestPayload<EdgeSdLanActivateNetworkPayload>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(EdgeSdLanUrls.activateEdgeMvSdLanNetwork, params, versionHeader)
        return { ...req, body: JSON.stringify(payload) }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivitySuccess(api, msg,
            EdgeSdLanActivityEnum.ACTIVATE_NETWORK,
            requestArgs.callback)
        })
      }
    }),
    // eslint-disable-next-line max-len
    deactivateEdgeMvSdLanNetwork: build.mutation<CommonResult, RequestPayload<EdgeSdLanActivateNetworkPayload>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(EdgeSdLanUrls.deactivateEdgeMvSdLanNetwork, params, versionHeader)
        return { ...req, body: JSON.stringify(payload) }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivitySuccess(api, msg,
            EdgeSdLanActivityEnum.DEACTIVATE_NETWORK,
            requestArgs.callback
          )
        })
      }
    })
  })
})

const transformMvSdLanGetData = (
  profile: EdgeMvSdLanResponseType,
  statusData: EdgeMvSdLanViewData,
  guestSettings: EdgeSdLanToggleDmzPayload
): EdgeMvSdLanExtended => {
  const networks: EdgeMvSdLanNetworks = {}
  Object.entries(groupBy(statusData.tunneledWlans, 'venueId')).forEach(([venueId, wlans]) => {
    networks[venueId] = wlans.map(wlan => wlan.networkId)
  })

  const guestNetworks: EdgeMvSdLanNetworks = {}
  Object.entries(groupBy(statusData.tunneledGuestWlans, 'venueId')).forEach(([venueId, wlans]) => {
    guestNetworks[venueId] = wlans.map(wlan => wlan.networkId)
  })

  return {
    ...profile,
    isGuestTunnelEnabled: guestSettings.isGuestTunnelEnabled,
    networks,
    guestEdgeClusterId: statusData.guestEdgeClusterId!,
    guestTunnelProfileId: statusData.guestTunnelProfileId!,
    guestNetworks
  } as EdgeMvSdLanExtended
}

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
  useToggleEdgeSdLanDmzMutation,
  // multi-venue
  useGetEdgeMvSdLanViewDataListQuery,
  useGetEdgeMvSdLanQuery,
  useAddEdgeMvSdLanMutation,
  useUpdateEdgeMvSdLanPartialMutation,
  useActivateEdgeMvSdLanNetworkMutation,
  useDeactivateEdgeMvSdLanNetworkMutation
} = edgeSdLanApi