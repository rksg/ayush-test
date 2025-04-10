import { isEqual, pick } from 'lodash'

import {
  useActivateEdgeMvSdLanNetworkMutation,
  useAddEdgeMvSdLanMutation,
  useDeactivateEdgeMvSdLanNetworkMutation,
  useUpdateEdgeMvSdLanPartialMutation
} from '@acx-ui/rc/services'
import { CommonErrorsResult, EdgeSdLanServiceProfile } from '@acx-ui/rc/utils'
import { CommonResult }                                from '@acx-ui/user'
import { CatchErrorDetails }                           from '@acx-ui/utils'

export const useEdgeSdLanActions = () => {
  const [addEdgeSdLan] = useAddEdgeMvSdLanMutation()
  const [updateEdgeSdLanMutation] = useUpdateEdgeMvSdLanPartialMutation()
  const [activateNetwork] = useActivateEdgeMvSdLanNetworkMutation()
  const [deactivateNetwork] = useDeactivateEdgeMvSdLanNetworkMutation()

  const diffVenueNetworks = (
    currentData: EdgeSdLanServiceProfile['activeNetwork'],
    originData?: EdgeSdLanServiceProfile['activeNetwork']
  ) => {
    const rmNetworks = originData?.filter(origin =>
      !currentData.some(current => current.networkId === origin.networkId)
    )
    const addNetworks = currentData.filter(current =>
      !originData?.some(origin =>
        origin.networkId === current.networkId &&
        origin.tunnelProfileId === current.tunnelProfileId
      )
    )

    return {
      rmNetworks,
      addNetworks
    }
  }

  const toggleNetworkChange = async (
    serviceId: string,
    venueId: string,
    networkId: string,
    currentTunnelProfileId: string,
    originTunnelProfileId: string | undefined,
    cb?: () => void
  ) => {
    const isChangeTunneling = currentTunnelProfileId !== originTunnelProfileId
    if (!isChangeTunneling) {
      return
    }
    if (originTunnelProfileId !== undefined && originTunnelProfileId !== null) {
      deactivateNetwork({
        customHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        },
        params: {
          serviceId,
          venueId: venueId,
          wifiNetworkId: networkId
        },
        callback: cb
      }).unwrap()
    }
    if (currentTunnelProfileId !== undefined && currentTunnelProfileId !== null) {
      activateNetwork({
        customHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        },
        params: {
          serviceId,
          venueId: venueId,
          wifiNetworkId: networkId
        },
        payload: {
          ...(currentTunnelProfileId ? {
            forwardingTunnelProfileId: currentTunnelProfileId
          } : {})
        },
        callback: cb
      }).unwrap()
    }
  }

  const handleNetworkChanges = async (
    serviceId: string,
    currentData: EdgeSdLanServiceProfile['activeNetwork'],
    originData?: EdgeSdLanServiceProfile['activeNetwork']
  ) => {
    const actions = []
    const { rmNetworks = [], addNetworks = [] } = diffVenueNetworks(currentData, originData)
    if (rmNetworks.length > 0) {
      actions.push(...rmNetworks.map(network => deactivateNetwork({
        customHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        },
        params: {
          serviceId,
          venueId: network.venueId,
          wifiNetworkId: network.networkId
        }
      }).unwrap()))
    }

    if (addNetworks.length > 0) {
      actions.push(...addNetworks.map(network => activateNetwork({
        customHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        },
        params: {
          serviceId,
          venueId: network.venueId,
          wifiNetworkId: network.networkId
        },
        payload: {
          ...(network.tunnelProfileId ? {
            forwardingTunnelProfileId: network.tunnelProfileId
          } : {})
        }
      }).unwrap()))
    }
    return Promise.all(actions)
  }

  const createEdgeSdLan = async (req: {
    payload: EdgeSdLanServiceProfile,
    callback?: (res: (CommonResult[]
      | CommonErrorsResult<CatchErrorDetails>)) => void
  }) => {
    const { payload, callback } = req
    return await addEdgeSdLan({
      customHeaders: {
        'Content-Type': 'application/vnd.ruckus.v1.1+json'
      },
      payload: pick(payload, ['name', 'tunnelProfileId']),
      callback: async (response: CommonResult) => {
        const serviceId = response.response?.id
        if (!serviceId) {
          // eslint-disable-next-line no-console
          console.error('empty service id')
          callback?.([])
          return
        }

        try {
          const reqResults = await handleNetworkChanges(serviceId, payload.activeNetwork)
          callback?.(reqResults)
        } catch(error) {
          callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        }
      }
    }).unwrap()
  }

  const updateEdgeSdLan = async (
    originData: EdgeSdLanServiceProfile,
    req: {
      payload: EdgeSdLanServiceProfile,
      callback?: (res: (CommonResult[]
        | CommonErrorsResult<CatchErrorDetails>)) => void
    }
  ) => {
    const { payload, callback } = req
    const actions = []
    const needUpdateSdLan = !isEqual(
      pick(originData, ['name']),
      pick(payload, ['name']))

    if(needUpdateSdLan && originData.id) {
      actions.push(updateEdgeSdLanMutation({
        customHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        },
        params: { serviceId: originData.id },
        payload: pick(payload, ['name'])
      }).unwrap())
    }

    try {
      const networkResults = await handleNetworkChanges(
        originData.id || '',
        payload.activeNetwork,
        originData.activeNetwork
      )
      const reqResults = await Promise.all([...actions, networkResults])
      callback?.(reqResults.flat())
    } catch(error) {
      callback?.(error as CommonErrorsResult<CatchErrorDetails>)
    }
  }

  return {
    createEdgeSdLan,
    updateEdgeSdLan,
    toggleNetworkChange
  }
}