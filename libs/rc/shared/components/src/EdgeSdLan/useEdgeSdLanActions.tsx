import _ from 'lodash'

import { showActionModal }              from '@acx-ui/components'
import { Features }                     from '@acx-ui/feature-toggle'
import {
  useActivateEdgeSdLanDmzClusterMutation,
  useActivateEdgeSdLanDmzTunnelProfileMutation,
  useActivateEdgeSdLanNetworkMutation,
  useAddEdgeSdLanP2Mutation,
  useDeactivateEdgeSdLanDmzTunnelProfileMutation,
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
import { getIntl } from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

export const useEdgeSdLanActions = () => {
  const [addEdgeSdLan] = useAddEdgeSdLanP2Mutation()
  const [updateEdgeSdLan] = useUpdateEdgeSdLanPartialP2Mutation()

  const [toggleDmz] = useToggleEdgeSdLanDmzMutation()
  const [activateDmzEdgeCluster] = useActivateEdgeSdLanDmzClusterMutation()
  const [activateDmzTunnel] = useActivateEdgeSdLanDmzTunnelProfileMutation()
  const [activateNetwork] = useActivateEdgeSdLanNetworkMutation()

  // const [deactivateDmzEdgeCluster] = useDeactivateEdgeSdLanDmzClusterMutation()
  const [deactivateDmzTunnel] = useDeactivateEdgeSdLanDmzTunnelProfileMutation()
  const [deactivateNetwork] = useDeactivateEdgeSdLanNetworkMutation()

  const activateGuestNetwork =
  (serviceId: string, networkId: string): Promise<CommonResult> => {
    return activateNetwork({
      params: {
        serviceId,
        wifiNetworkId: networkId
      },
      payload: {
        isGuestTunnelUtilized: true
      }
    }).unwrap()
  }

  const deactivateGuestNetwork =
    (serviceId: string, networkId: string): Promise<CommonResult> => {
      return activateNetwork({
        params: {
          serviceId,
          wifiNetworkId: networkId
        },
        payload: {
          isGuestTunnelUtilized: false
        }
      }).unwrap()
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

        const actions = payload.isGuestTunnelEnabled
          ? [
            toggleDmz({ params: {
              serviceId
            }, payload: {
              isGuestTunnelEnabled: true
            } }).unwrap(),

            activateDmzEdgeCluster({ params: {
              serviceId,
              venueId: payload.venueId,
              edgeClusterId: payload.guestEdgeClusterId
            } }).unwrap(),

            activateDmzTunnel({ params: {
              serviceId,
              tunnelProfileId: payload.guestTunnelProfileId
            } }).unwrap(),

            ...dcNetworkIds.map((item) => {
              return activateNetwork({
                params: {
                  serviceId,
                  wifiNetworkId: item
                }, payload: { isGuestTunnelUtilized: false }
              }).unwrap()
            }),

            ...payload.guestNetworkIds.map((item) => {
              return activateGuestNetwork(serviceId!, item)
            })]
          : [
            ...payload.networkIds.map((item) => {
              return activateNetwork({
                params: {
                  serviceId,
                  wifiNetworkId: item
                }, payload: { isGuestTunnelUtilized: false }
              }).unwrap()
            })]

        try {
          const reqResult = await Promise.all(actions)
          callback?.(reqResult)
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
        const actions = []

        // diff `originData` vs `req.payload`
        // isGuestTunnelEnabled changed
        if (originData.isGuestTunnelEnabled !== payload.isGuestTunnelEnabled) {
          actions.push(toggleDmz({ params: {
            serviceId
          }, payload: {
            isGuestTunnelEnabled: payload.isGuestTunnelEnabled
          } }).unwrap())

          // doesn't need to deactivateDmzCluster when isGuestTunnelEnabled changed into false
          if (payload.isGuestTunnelEnabled && !originData.guestEdgeClusterId) {
            actions.push(activateDmzEdgeCluster({ params: {
              serviceId,
              venueId: payload.venueId,
              edgeClusterId: payload.guestEdgeClusterId
            } }).unwrap())
          }
        }

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

        const rmNetworks = _.difference(originData.networkIds, payload.networkIds)
        const addNetworks = _.difference(payload.networkIds, originData.networkIds)
        const rmGuestNetworks = _.difference(originData.guestNetworkIds, payload.guestNetworkIds)
        const addGuestNetworks = _.difference(payload.guestNetworkIds, originData.guestNetworkIds)

        const activateDcNetworks = _.difference(addNetworks, addGuestNetworks)
        const deactivateDmzNetworks = _.difference(rmGuestNetworks, rmNetworks)
        actions.push(...activateDcNetworks.map((item) => activateNetwork({
          params: {
            serviceId,
            wifiNetworkId: item
          }, payload: { isGuestTunnelUtilized: false }
        }).unwrap()))
        actions.push(...rmNetworks.map((item) => deactivateNetwork({ params: {
          serviceId,
          wifiNetworkId: item
        } }).unwrap()))

        // handle guestNetworkIds changes
        actions.push(...addGuestNetworks.map((item) => activateGuestNetwork(serviceId, item)))
        actions.push(...deactivateDmzNetworks.map(
          (item) => deactivateGuestNetwork(serviceId, item)))

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

export const useSdLanScopedNetworks = (venueId: string | undefined,
  networkIds: string[] | undefined) => {
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)

  const { data } = useGetEdgeSdLanP2ViewDataListQuery({
    payload: {
      filters: { networkIds, venueId: [venueId] },
      fields: [
        'id',
        'venueId',
        'isGuestTunnelEnabled',
        'tunnelProfileId',
        'guestTunnelProfileId',
        'networkIds',
        ...(isEdgeSdLanHaReady ? ['edgeClusterId', 'edgeClusterName'] : ['edgeId', 'edgeName'])
      ],
      pageSize: 10000
    }
  }, {
    skip: !venueId || !networkIds || !(isEdgeSdLanReady || isEdgeSdLanHaReady)
  })

  return {
    sdLans: data?.data,
    scopedNetworkIds: _.uniq(_.flatMap(data?.data, (item) => item.networkIds))
  }
}

export const useSdLanScopedNetworkVenues = (networkId: string | undefined) => {
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)

  const { data } = useGetEdgeSdLanP2ViewDataListQuery({
    payload: {
      filters: { networkIds: [networkId] },
      fields: [
        'id',
        'venueId',
        'isGuestTunnelEnabled',
        'tunnelProfileId',
        'guestTunnelProfileId',
        ...(isEdgeSdLanHaReady ? ['edgeClusterId', 'edgeClusterName'] : ['edgeId', 'edgeName'])
      ],
      pageSize: 10000
    }
  }, {
    skip: !networkId || !(isEdgeSdLanReady || isEdgeSdLanHaReady)
  })

  return {
    sdLansVenueMap: _.groupBy(data?.data, 'venueId'),
    networkVenueIds: data?.data?.map(item => item.venueId)
  }
}

export const checkSdLanScopedNetworkDeactivateAction =
  (
    scopedIds: string[] | undefined,
    selectedIds: string[] | undefined,
    cb: () => void
  ) => {
    if (!scopedIds || !selectedIds) {
      cb()
      return
    }

    const { $t } = getIntl()

    if (_.intersection(scopedIds, selectedIds).length > 0) {
      showActionModal({
        type: 'confirm',
        title: $t({ defaultMessage: 'Deactivate network' }),
        content: selectedIds!.length === 1
          // eslint-disable-next-line max-len
          ? $t({ defaultMessage: 'This network is running the SD-LAN service on this venue. Are you sure you want to deactivate it?' })
          // eslint-disable-next-line max-len
          : $t({ defaultMessage: 'The SD-LAN service is running on one or some of the selected venues. Are you sure you want to deactivate?' }),
        okText: $t({ defaultMessage: 'Deactivate' }),
        onOk: () => {
          cb()
        }
      })
    } else {
      cb()
    }
  }