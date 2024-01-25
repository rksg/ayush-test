import _ from 'lodash'

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
import { CatchErrorDetails, CommonErrorsResult, CommonResult, EdgeSdLanSettingP2 } from '@acx-ui/rc/utils'

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
    callback?: (res: (CommonResult[]
      | CommonErrorsResult<CatchErrorDetails>)) => void
  }) => {
    const { payload, callback } = req

    return await addEdgeSdLan({
      payload,
      callback: async (response: CommonResult) => {
        const serviceId = response.response?.id
        const actions = payload.isGuestTunnelEnabled
          ? [activateDmzEdgeCluster({ params: {
            serviceId,
            venueId: payload.venueId,
            edgeClusterId: payload.guestEdgeId
          } }).unwrap(),
          activateDmzTunnel({ params: {
            serviceId,
            tunnelProfileId: payload.guestTunnelProfileId
          } }).unwrap(),
          ...payload.guestNetworkIds.map((item) => {
            return activateNetwork({
              params: {
                serviceId,
                wifiNetworkId: item
              },
              payload: {
                isGuestTunnelUtilized: true
              }
            }).unwrap()
          })]
          : []

        try {
          const relationActs = await Promise.all(actions)
          callback?.(relationActs)
        } catch(error) {
          callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        }
      }
    }).unwrap()
  }

  const editSdLan = async (originData: EdgeSdLanSettingP2, req: {
    payload: EdgeSdLanSettingP2,
    callback?: (res: (CommonResult[]
      | CommonErrorsResult<CatchErrorDetails>)) => void
  }) => {
    const { payload, callback } = req
    const { id: serviceId, ...submitPayload } = payload

    return await updateEdgeSdLan({
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
          } }).unwrap())
        }

        // diff `originData` vs `req.payload`
        if (originData.guestTunnelProfileId !== payload.guestTunnelProfileId) {
          if (originData.guestTunnelProfileId) {
            actions.push(deactivateDmzTunnel({ params: {
              serviceId,
              tunnelProfileId: originData.guestTunnelProfileId
            } }).unwrap())
          }

          if (payload.guestTunnelProfileId) {
            actions.push(activateDmzTunnel({ params: {
              serviceId,
              tunnelProfileId: payload.guestTunnelProfileId
            } }).unwrap())
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
            isGuestTunnelUtilized: true
          }
        }).unwrap()))
        actions.push(...deactivateItems.map((item) => deactivateNetwork({ params: {
          serviceId,
          wifiNetworkId: item
        } }).unwrap()))

        try {
          const relationActs = await Promise.all(actions)
          callback?.(relationActs)
        } catch(error) {
          callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        }
      }
    }).unwrap()
  }

  return {
    addEdgeSdLan: addSdLan,
    editEdgeSdLan: editSdLan
  }
}