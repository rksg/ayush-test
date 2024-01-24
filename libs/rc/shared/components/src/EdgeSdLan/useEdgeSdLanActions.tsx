import { SerializedError }     from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import _                       from 'lodash'

import {
  useActivateEdgeSdLanDmzClusterMutation,
  useActivateEdgeSdLanDmzTunnelProfileMutation,
  useActivateEdgeSdLanNetworkMutation,
  useAddEdgeSdLanP2Mutation,
  useDeactivateEdgeSdLanDmzClusterMutation,
  useDeactivateEdgeSdLanDmzTunnelProfileMutation,
  useDeactivateEdgeSdLanNetworkMutation,
  useUpdateEdgeSdLanPartialP2Mutation
} from '@acx-ui/rc/services'
import { CommonResult, EdgeSdLanSettingP2 } from '@acx-ui/rc/utils'

export const useEdgeSdLanActions = () => {
  const [addEdgeSdLan] = useAddEdgeSdLanP2Mutation()
  const [updateEdgeSdLan] = useUpdateEdgeSdLanPartialP2Mutation()

  const [activateDmzEdgeCluster] = useActivateEdgeSdLanDmzClusterMutation()
  const [activateDmzTunnel] = useActivateEdgeSdLanDmzTunnelProfileMutation()
  const [activateNetwork] = useActivateEdgeSdLanNetworkMutation()

  const [deactivateDmzEdgeCluster] = useDeactivateEdgeSdLanDmzClusterMutation()
  const [deactivateDmzTunnel] = useDeactivateEdgeSdLanDmzTunnelProfileMutation()
  const [deactivateNetwork] = useDeactivateEdgeSdLanNetworkMutation()

  const addSdLan = async (req: {
    payload: EdgeSdLanSettingP2,
    callback?: (res: ({ data: CommonResult; }
      | { error: FetchBaseQueryError | SerializedError; })[]) => void
  }) => {
    const { payload, callback } = req

    await addEdgeSdLan({
      payload,
      callback: async (response: CommonResult) => {
        const serviceId = response.response?.id
        const actions = payload.isGuestTunnelEnabled
          ? [activateDmzEdgeCluster({ params: {
            serviceId,
            venueId: payload.venueId,
            edgeClusterId: payload.guestEdgeId
          } }),
          activateDmzTunnel({ params: {
            serviceId,
            tunnelProfileId: payload.guestTunnelProfileId
          } }),
          ...payload.guestNetworkIds.map((item) => {
            return activateNetwork({
              params: {
                serviceId,
                wifiNetworkId: item
              },
              payload: {
                isGuestEnabled: true
              }
            })
          })]
          : []

        const relationActs = await Promise.all(actions)
        callback?.(relationActs)
      }
    }).unwrap()
  }

  const editSdLan = async (originData: EdgeSdLanSettingP2, req: {
    payload: EdgeSdLanSettingP2,
    callback?: (res: ({ data: CommonResult; }
      | { error: FetchBaseQueryError | SerializedError; })[]) => void
  }) => {
    const { payload, callback } = req
    const { id: serviceId, ...submitPayload } = payload

    await updateEdgeSdLan({
      payload: submitPayload,
      params: { serviceId },
      callback: async () => {
        const actions = []
        // isGuestTunnelEnabled changed
        if (originData.isGuestTunnelEnabled !== payload.isGuestTunnelEnabled) {
          actions.push((payload.isGuestTunnelEnabled
            ? activateDmzEdgeCluster
            : deactivateDmzEdgeCluster)({ params: {
            serviceId,
            venueId: payload.venueId,
            edgeClusterId: payload.guestEdgeId
          } }))
        }

        // diff `originData` vs `req.payload`
        if (originData.guestTunnelProfileId !== payload.guestTunnelProfileId) {
          if (originData.guestTunnelProfileId) {
            actions.push(deactivateDmzTunnel({ params: {
              serviceId,
              tunnelProfileId: originData.guestTunnelProfileId
            } }))
          }

          if (payload.guestTunnelProfileId) {
            actions.push(activateDmzTunnel({ params: {
              serviceId,
              tunnelProfileId: payload.guestTunnelProfileId
            } }))
          }
        }

        // eslint-disable-next-line max-len
        const deactivateItems = _.difference(originData.guestNetworkIds, payload.guestNetworkIds)
        const activateItems = _.difference(payload.guestNetworkIds, originData.guestNetworkIds)
        actions.push(...activateItems.map((item) => activateNetwork({
          params: {
            serviceId,
            wifiNetworkId: item
          },
          payload: {
            isGuestEnabled: true
          }
        })))
        actions.push(...deactivateItems.map((item) => deactivateNetwork({ params: {
          serviceId,
          wifiNetworkId: item
        } })))

        const relationActs = await Promise.all(actions)
        callback?.(relationActs)
      }
    }).unwrap()
  }

  return {
    addEdgeSdLan: addSdLan,
    editEdgeSdLan: editSdLan
  }
}