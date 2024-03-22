import _ from 'lodash'

import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  useActivateEdgeSdLanDmzClusterMutation,
  useActivateEdgeSdLanDmzTunnelProfileMutation,
  useActivateEdgeSdLanNetworkMutation,
  useAddEdgeSdLanP2Mutation,
  useDeactivateEdgeSdLanNetworkMutation,
  useGetEdgeSdLanP2ViewDataListQuery,
  useToggleEdgeSdLanDmzMutation,
  useUpdateEdgeSdLanPartialP2Mutation
} from '@acx-ui/rc/services'
import {
  CatchErrorDetails,
  CommonErrorsResult,
  CommonResult,
  EdgeSdLanSettingP2
} from '@acx-ui/rc/utils'

export const useEdgeSdLanActions = () => {
  const [addEdgeSdLan] = useAddEdgeSdLanP2Mutation()
  const [updateEdgeSdLan] = useUpdateEdgeSdLanPartialP2Mutation()

  const [toggleDmz] = useToggleEdgeSdLanDmzMutation()
  const [activateDmzEdgeCluster] = useActivateEdgeSdLanDmzClusterMutation()
  const [activateDmzTunnel] = useActivateEdgeSdLanDmzTunnelProfileMutation()
  const [activateNetwork] = useActivateEdgeSdLanNetworkMutation()
  const [deactivateNetwork] = useDeactivateEdgeSdLanNetworkMutation()

  const activateGuestEdgeCluster =
  (serviceId: string, payload: EdgeSdLanSettingP2): Promise<CommonResult> => {
    return activateDmzEdgeCluster({ params: {
      serviceId,
      venueId: payload.venueId,
      edgeClusterId: payload.guestEdgeClusterId
    } }).unwrap()
  }

  const activateGuestTunnel =
  (serviceId: string, payload: EdgeSdLanSettingP2): Promise<CommonResult> => {
    return activateDmzTunnel({ params: {
      serviceId,
      tunnelProfileId: payload.guestTunnelProfileId
    } }).unwrap()
  }

  const toggleGuestTunnelEnable =
  (serviceId: string, enabled: boolean): Promise<CommonResult> => {
    return toggleDmz({ params: {
      serviceId
    }, payload: {
      isGuestTunnelEnabled: enabled
    } }).unwrap()
  }

  const toggleGuestNetwork =
  (serviceId: string, networkId: string, activated: boolean): Promise<CommonResult> => {
    return activateNetwork({
      params: {
        serviceId,
        wifiNetworkId: networkId
      },
      payload: {
        isGuestTunnelUtilized: activated
      }
    }).unwrap()
  }

  const activateDcNetwork =
  (serviceId: string, networkId: string): Promise<CommonResult> => {
    return toggleGuestNetwork(serviceId, networkId, false)
  }

  const deactivateDcNetwork =
  (serviceId: string, networkId: string): Promise<CommonResult> => {
    return deactivateNetwork({ params: {
      serviceId,
      wifiNetworkId: networkId
    } }).unwrap()
  }

  const activateGuestNetwork =
  (serviceId: string, networkId: string): Promise<CommonResult> => {
    return toggleGuestNetwork(serviceId, networkId, true)
  }

  const deactivateGuestNetwork =
    (serviceId: string, networkId: string): Promise<CommonResult> => {
      return toggleGuestNetwork(serviceId, networkId, false)
    }


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
        const dcNetworkIds = payload.isGuestTunnelEnabled
          ? _.difference(payload.networkIds, payload.guestNetworkIds)
          : []

        const optActions = []
        const allResults = []

        if (payload.isGuestTunnelEnabled) {
          const requiredActions = [
            activateGuestEdgeCluster(serviceId!, payload),
            activateGuestTunnel(serviceId!, payload)
          ]

          try {
            const reqResult = await Promise.all(requiredActions)
            allResults.push(...reqResult)

            optActions.push(...[
              toggleGuestTunnelEnable(serviceId!, true),
              ...dcNetworkIds.map((item) => activateDcNetwork(serviceId!, item)),
              ...payload.guestNetworkIds.map((item) => activateGuestNetwork(serviceId!, item))
            ])
          } catch(error) {
            callback?.(error as CommonErrorsResult<CatchErrorDetails>)
            return
          }
        } else {
          optActions.push(...[
            ...payload.networkIds.map((item) => activateDcNetwork(serviceId!, item))])
        }

        try {
          const reqResult = await Promise.all(optActions)
          callback?.(allResults.concat(reqResult))
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
    const serviceId = payload.id

    return await updateEdgeSdLan({
      payload: {
        name: payload.name,
        tunnelProfileId: payload.tunnelProfileId
      },
      params: { serviceId },
      callback: async () => {
        // eslint-disable-next-line max-len
        const isGuestTunnelChanged = originData.isGuestTunnelEnabled !== payload.isGuestTunnelEnabled
        const actions = []
        const allResults = []

        // diff `originData` vs `req.payload`
        if (isGuestTunnelChanged) {
          // doesn't need to handle deactivateDmzCluster when isGuestTunnelEnabled changed into false

          const requiredActions = []
          // DC scenario into DMZ scenario
          if (payload.isGuestTunnelEnabled && !originData.guestEdgeClusterId) {
            requiredActions.push(activateGuestEdgeCluster(serviceId!, payload))
            requiredActions.push(activateGuestTunnel(serviceId!, payload))

            try {
              const reqResult = await Promise.all(requiredActions)
              allResults.push(...reqResult)
            } catch(error) {
              // if the required field: DmzEdgeCluster/ DMZTunnelProfile failed
              // non need to trigger furthur actions
              callback?.(error as CommonErrorsResult<CatchErrorDetails>)
              return
            }
          }

          actions.push(toggleGuestTunnelEnable(serviceId!, payload.isGuestTunnelEnabled))
        } else {
          // for change guest tunnel: only need to do PUT
          if (originData.guestTunnelProfileId !== payload.guestTunnelProfileId) {
            actions.push(activateGuestTunnel(serviceId!, payload))
          }
        }

        const rmNetworks = _.difference(originData.networkIds, payload.networkIds)
        const addNetworks = _.difference(payload.networkIds, originData.networkIds)
        const rmGuestNetworks = _.difference(originData.guestNetworkIds, payload.guestNetworkIds)
        const addGuestNetworks = _.difference(payload.guestNetworkIds, originData.guestNetworkIds)

        const activateDcNetworks = _.difference(addNetworks, addGuestNetworks)
        const deactivateDmzNetworks = _.difference(rmGuestNetworks, rmNetworks)
        actions.push(...activateDcNetworks.map((item) => activateDcNetwork(serviceId!, item)))
        actions.push(...rmNetworks.map((item) => deactivateDcNetwork(serviceId!, item)))

        // handle guestNetworkIds changes
        actions.push(...addGuestNetworks.map((item) => activateGuestNetwork(serviceId, item)))
        actions.push(...deactivateDmzNetworks.map(
          (item) => deactivateGuestNetwork(serviceId, item))
        )

        try {
          const relationActs = await Promise.all(actions)
          callback?.(allResults.concat(relationActs))
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

// id: is `serialNumber` when SD_LAN HA FF off
//     means `clusterId` when SD_LAN HA FF on
export const useGetEdgeSdLanByEdgeOrClusterId = (id?: string) => {
  const isEdgeSdLanReady = useIsSplitOn(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsSplitOn(Features.EDGES_SD_LAN_HA_TOGGLE)

  const {
    edgeSdLanData,
    isLoading,
    isFetching
  } = useGetEdgeSdLanP2ViewDataListQuery(
    { payload: {
      filters: isEdgeSdLanHaReady
        ? undefined
        : { edgeId: [id] },
      fields: ['id'].concat((isEdgeSdLanHaReady
        ? ['edgeClusterId', 'guestEdgeClusterId']
        : 'edgeId'))
    } },
    {
      skip: !id || !(isEdgeSdLanReady || isEdgeSdLanHaReady),
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        edgeSdLanData: data?.data?.filter((item, idx) => {
          return isEdgeSdLanHaReady
            ? (item.edgeClusterId === id || item.guestEdgeClusterId === id)
            : idx === 0
        })[0],
        isLoading,
        isFetching
      })
    })

  return {
    edgeSdLanData,
    isLoading,
    isFetching
  }
}