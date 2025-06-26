import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { groupBy }             from 'lodash'

import {
  TableResult,
  CommonResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  EdgeSdLanUrls,
  EdgeSdLanActivateNetworkPayload,
  EdgeSdLanToggleDmzPayload,
  EdgeMvSdLanExtended,
  EdgeMvSdLanViewData,
  EdgeMvSdLanNetworks,
  EdgeMvSdLanResponseType,
  isEdgeWlanTemplate
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
  ACTIVATE_GUEST_EDGE = 'Activate guest edge',
  DEACTIVATE_GUEST_EDGE = 'Deactivate guest edge'
}

export const edgeSdLanApi = baseEdgeSdLanApi.injectEndpoints({
  endpoints: (build) => ({
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
       transformResponse: (result: TableResult<EdgeMvSdLanViewData>) => {
         result.data.forEach(d => {
           d.tunneledWlanTemplates = d.tunneledWlans
             ?.filter(w => isEdgeWlanTemplate(w.wlanId))

           d.tunneledWlans = d.tunneledWlans
             ?.filter(w => !isEdgeWlanTemplate(w.wlanId))
         })
         return result
       },
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
      query: ({ params, payload, customHeaders }) => {
        const req = createHttpRequest(
          EdgeSdLanUrls.addEdgeSdLan,
          params,
          customHeaders || versionHeader
        )
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
    activateEdgeSdLanDmzCluster: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(EdgeSdLanUrls.activateEdgeSdLanDmzCluster,
            params,
            versionHeader)
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: EdgeSdLanActivityEnum.ACTIVATE_GUEST_EDGE,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
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
      },
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
    getEdgeSdLanIsDmz: build.query<EdgeSdLanToggleDmzPayload, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EdgeSdLanUrls.getEdgeSdLanIsDmz, params, versionHeader)
        return { ...req }
      }
    }),
    // eslint-disable-next-line max-len
    activateEdgeMvSdLanNetwork: build.mutation<CommonResult, RequestPayload<EdgeSdLanActivateNetworkPayload>>({
      query: ({ params, payload, customHeaders }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(
          EdgeSdLanUrls.activateEdgeMvSdLanNetwork,
          params,
          customHeaders || versionHeader
        )
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
      query: ({ params, payload, customHeaders }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(
          EdgeSdLanUrls.deactivateEdgeMvSdLanNetwork,
          params,
          customHeaders || versionHeader
        )
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

export const {
  useDeleteEdgeSdLanMutation,
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