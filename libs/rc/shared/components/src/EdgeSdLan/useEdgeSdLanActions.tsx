/* eslint-disable max-len */
import { useMemo } from 'react'

import { difference, flatMap, uniq, groupBy, intersection, isNil, isEqual, pick } from 'lodash'

import { showActionModal }              from '@acx-ui/components'
import { Features }                     from '@acx-ui/feature-toggle'
import {
  useActivateEdgeMvSdLanNetworkMutation,
  useActivateEdgeSdLanDmzClusterMutation,
  useActivateEdgeSdLanDmzTunnelProfileMutation,
  useAddEdgeMvSdLanMutation,
  useDeactivateEdgeMvSdLanNetworkMutation,
  useDeactivateEdgeSdLanDmzClusterMutation,
  useGetEdgeSdLanP2ViewDataListQuery,
  useToggleEdgeSdLanDmzMutation,
  useUpdateEdgeMvSdLanPartialMutation
} from '@acx-ui/rc/services'
import {
  CommonErrorsResult,
  CommonResult,
  EdgeMvSdLanExtended,
  EdgeMvSdLanNetworks,
  EdgeMvSdLanViewData,
  EdgeSdLanSettingP2,
  EdgeSdLanViewDataP2
} from '@acx-ui/rc/utils'
import { getIntl, CatchErrorDetails } from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

// return the networks NOT included in `second`
const differenceVenueNetworks = (first: EdgeMvSdLanNetworks, second: EdgeMvSdLanNetworks) => {
  const diffResult: EdgeMvSdLanNetworks = {}

  Object.entries(first).forEach(([venueId, networkIds]) => {
    if (second[venueId]) {
      const diffNetworks = difference(networkIds, second[venueId])
      diffResult[venueId] = diffNetworks
    } else {
      diffResult[venueId] = first[venueId]
    }
  })

  return diffResult
}

enum ActivationType {
  activate = 'activate',
  deactivate = 'deactivate'
}

const useEdgeSdLanCommonActions = () => {
  const [toggleDmz] = useToggleEdgeSdLanDmzMutation()
  const [activateDmzEdgeCluster] = useActivateEdgeSdLanDmzClusterMutation()
  const [activateDmzTunnel] = useActivateEdgeSdLanDmzTunnelProfileMutation()

  const activateGuestEdgeCluster = (
    serviceId: string, payload: EdgeSdLanSettingP2 | EdgeMvSdLanExtended,
    activityCallback?: (res: (CommonResult[] | CommonErrorsResult<CatchErrorDetails>)) => void
  ): Promise<CommonResult> => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await activateDmzEdgeCluster({
          params: {
            serviceId,
            venueId: payload.venueId,
            edgeClusterId: payload.guestEdgeClusterId
          },
          callback: () => {
            activityCallback?.([res])
            resolve(res)
          } }).unwrap()

        if (!activityCallback)
          resolve(res)
      } catch(e) {
        reject(e as CommonErrorsResult<CatchErrorDetails>)
      }
    })
  }

  const activateGuestTunnel =
  (serviceId: string, payload: EdgeSdLanSettingP2 | EdgeMvSdLanExtended): Promise<CommonResult> => {
    return activateDmzTunnel({ params: {
      serviceId,
      tunnelProfileId: payload.guestTunnelProfileId
    } }).unwrap()
  }

  const toggleGuestTunnelEnable = async (
    serviceId: string, enabled: boolean,
    activityCallback?: (res: (CommonResult[] | CommonErrorsResult<CatchErrorDetails>)) => void
  ): Promise<CommonResult> => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await toggleDmz({
          params: { serviceId },
          payload: { isGuestTunnelEnabled: enabled },
          callback: () => {
            activityCallback?.([res])
            resolve(res)
          } }).unwrap()

        if (!activityCallback)
          resolve(res)
      } catch(e) {
        reject(e as CommonErrorsResult<CatchErrorDetails>)
      }
    })
  }

  return {
    activateGuestEdgeCluster,
    activateGuestTunnel,
    toggleGuestTunnelEnable
  }
}

export const useEdgeMvSdLanActions = () => {
  const {
    activateGuestEdgeCluster,
    activateGuestTunnel,
    toggleGuestTunnelEnable
  } = useEdgeSdLanCommonActions()
  const [addEdgeSdLan] = useAddEdgeMvSdLanMutation()
  const [updateEdgeSdLan] = useUpdateEdgeMvSdLanPartialMutation()

  const [activateNetwork] = useActivateEdgeMvSdLanNetworkMutation()
  const [deactivateNetwork] = useDeactivateEdgeMvSdLanNetworkMutation()
  const [deactivateEdgeDmzCluster] = useDeactivateEdgeSdLanDmzClusterMutation()

  const toggleGuestNetwork = (venueId: string, serviceId: string, networkId: string, activated: boolean): Promise<CommonResult> => {
    return activateNetwork({
      params: {
        venueId,
        serviceId,
        wifiNetworkId: networkId
      },
      payload: {
        isGuestTunnelUtilized: activated
      }
    }).unwrap()
  }

  const activateDcNetwork =
  (venueId: string, serviceId: string, networkId: string): Promise<CommonResult> => {
    return toggleGuestNetwork(venueId, serviceId, networkId, false)
  }

  const deactivateDcNetwork =
  (venueId: string, serviceId: string, networkId: string): Promise<CommonResult> => {
    return deactivateNetwork({ params: {
      venueId,
      serviceId,
      wifiNetworkId: networkId
    } }).unwrap()
  }

  const activateGuestNetwork =
  (venueId: string, serviceId: string, networkId: string): Promise<CommonResult> => {
    return toggleGuestNetwork(venueId, serviceId, networkId, true)
  }

  const deactivateGuestNetwork =
    (venueId: string, serviceId: string, networkId: string): Promise<CommonResult> => {
      return toggleGuestNetwork(venueId, serviceId, networkId, false)
    }

  const getActivateActionsFromType = (
    serviceId: string, networks: EdgeMvSdLanNetworks, type: ActivationType, isGuestEnabled: boolean
  ) => {
    const actionFn = type === ActivationType.activate
      ? (isGuestEnabled ? activateGuestNetwork : activateDcNetwork)
      : (isGuestEnabled ? deactivateGuestNetwork : deactivateDcNetwork)

    return Object.entries(networks)
      .flatMap(([venueId, networkIds]) =>
        networkIds.map((id) => actionFn(venueId, serviceId!, id)))
  }

  const handleGuestTunnelEnableDiff = async (
    serviceId: string,
    originData: EdgeMvSdLanExtended | undefined,
    payload: EdgeMvSdLanExtended,
    activityCallback?: (res: (CommonResult[]
      | CommonErrorsResult<CatchErrorDetails>)) => void
  ): Promise<CommonResult | CommonErrorsResult<CatchErrorDetails>> => {

    // DC scenario into DMZ scenario
    // or addMode DMZ scenario
    if (payload.isGuestTunnelEnabled) {
      return await activateGuestEdgeCluster(serviceId, { ...payload, venueId: payload.guestEdgeClusterVenueId }, async () => {
        if (originData?.guestTunnelProfileId !== payload.guestTunnelProfileId) {
          await activateGuestTunnel(serviceId, payload)
        }

        // skip if isGuestTunnelEnabled === false
        // we MUST directly trigger mutation hook to ensure onCacheEntryAdded is called
        // here we CANNOT push it into Promise batch trigger.
        await toggleGuestTunnelEnable(serviceId, payload.isGuestTunnelEnabled)
        activityCallback?.([])
      })
    } else {
      return await toggleGuestTunnelEnable(serviceId, payload.isGuestTunnelEnabled, async () => {
        if (originData?.guestEdgeClusterId && originData?.guestEdgeClusterVenueId) {
          await deactivateEdgeDmzCluster({ params: {
            serviceId,
            edgeClusterId: originData!.guestEdgeClusterId,
            venueId: originData!.guestEdgeClusterVenueId
          } }).unwrap()
        }

        activityCallback?.([])
      })
    }
  }

  const handleAssociationDiff = async (
    serviceId: string,
    originData: EdgeMvSdLanExtended | undefined,
    payload: EdgeMvSdLanExtended,
    activityCallback?: (res: (CommonResult[]
      | CommonErrorsResult<CatchErrorDetails>)) => void
  ): Promise<CommonResult[] | CommonErrorsResult<CatchErrorDetails>> => {
    try {
      const isAddMode: boolean = isNil(originData)

      if (isAddMode) {
        originData = { networks: {}, guestNetworks: {} } as EdgeMvSdLanExtended
      }

      const actions = []
      const allResults = []

      // addMode guestTunnelEnabled
      // OR editMode guestTunnelEnabled changed
      const isGuestTunnelChanged = (isAddMode && payload.isGuestTunnelEnabled)
        || (!isAddMode && originData?.isGuestTunnelEnabled !== payload.isGuestTunnelEnabled)
      if (isGuestTunnelChanged) {
        const res = await handleGuestTunnelEnableDiff(serviceId, originData, payload, activityCallback)
        allResults.push(res as CommonResult)
      } else {
        if (!isAddMode && payload.isGuestTunnelEnabled) {
          if (originData?.guestEdgeClusterId !== payload.guestEdgeClusterId) {
            actions.push(activateGuestEdgeCluster(serviceId, { ...payload, venueId: payload.guestEdgeClusterVenueId }))
          }

          if (originData?.guestTunnelProfileId !== payload.guestTunnelProfileId)
            actions.push(activateGuestTunnel(serviceId, payload))
        }
      }

      // process networks diff
      const rmNetworks = differenceVenueNetworks(originData!.networks, payload.networks)
      const addNetworks = differenceVenueNetworks(payload.networks, originData!.networks)

      let addGuestNetworks: EdgeMvSdLanNetworks = {}
      if (payload.isGuestTunnelEnabled) {
        addGuestNetworks = differenceVenueNetworks(payload.guestNetworks, originData!.guestNetworks)

        const rmGuestNetworks = differenceVenueNetworks(originData!.guestNetworks, payload.guestNetworks)
        const deactivateDmzNetworks = differenceVenueNetworks(rmGuestNetworks, rmNetworks)

        // handle guestNetworkIds changes
        actions.push(...getActivateActionsFromType(serviceId, addGuestNetworks, ActivationType.activate, true))
        actions.push(...getActivateActionsFromType(serviceId, deactivateDmzNetworks, ActivationType.deactivate, true))
      } else {
        addGuestNetworks = {} as EdgeMvSdLanNetworks
      }

      const activateDcNetworks = differenceVenueNetworks(addNetworks, addGuestNetworks)

      actions.push(...getActivateActionsFromType(serviceId, activateDcNetworks, ActivationType.activate, false))
      actions.push(...getActivateActionsFromType(serviceId, rmNetworks, ActivationType.deactivate, false))

      const relationActs = await Promise.all(actions)
      !isGuestTunnelChanged && activityCallback?.(relationActs)
      return Promise.resolve(allResults.concat(relationActs))
    } catch(error) {
      return Promise.reject(error as CommonErrorsResult<CatchErrorDetails>)
    }
  }

  const addSdLan = async (req: {
    payload: EdgeMvSdLanExtended,
    callback?: (res: (CommonResult[]
      | CommonErrorsResult<CatchErrorDetails>)) => void
  }) => {
    const { payload, callback } = req

    return await addEdgeSdLan({
      payload,
      callback: async (response: CommonResult) => {
        const serviceId = response.response?.id
        if (!serviceId) {
          // eslint-disable-next-line no-console
          console.error('empty service id')
          callback?.([])
          return
        }

        try {
          await handleAssociationDiff(serviceId!,
            undefined,
            payload,
            callback
          )
        } catch(error) {
          callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        }
      }
    }).unwrap()
  }

  const editSdLan = async (originData: EdgeMvSdLanExtended, req: {
    payload: EdgeMvSdLanExtended,
    callback?: (res: (CommonResult[]
      | CommonErrorsResult<CatchErrorDetails>)) => void
  }) => {
    const { payload, callback } = req
    const serviceId = payload.id

    if (isEqual(
      pick(originData, ['id', 'name', 'tunnelProfileId']),
      pick(payload, ['id', 'name', 'tunnelProfileId']))
    ) {
      try {
        await handleAssociationDiff(serviceId!, originData, payload, callback)
      } catch(error) {
        callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        return Promise.reject(error as CommonErrorsResult<CatchErrorDetails>)
      }
    } else {
      try {
        await updateEdgeSdLan({
          payload: {
            name: payload.name,
            tunnelProfileId: payload.tunnelProfileId
          },
          params: { serviceId }
        }).unwrap()

        await handleAssociationDiff(serviceId!, originData, payload, callback)
      } catch(error) {
        callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        return Promise.reject(error as CommonErrorsResult<CatchErrorDetails>)
      }
    }

    return Promise.resolve()
  }

  /** use cases
   * activate network:        activate = true, isGuest = false
   * deactivate network:      activate = false, isGuest = false
   * activate guestNetwork:   activate = true, isGuest = true
   * deactivate guestNetwork: activate = true, isGuest = false
   */
  const toggleNetwork = async (
    serviceId: string,
    venueId: string,
    networkId: string,
    activate: boolean,
    isGuest: boolean,
    cb?: () => void) => {
    // - activate network
    // - activate/deactivate guestNetwork
    if (activate) {
      await activateNetwork({
        params: {
          venueId,
          serviceId,
          wifiNetworkId: networkId
        },
        payload: {
          isGuestTunnelUtilized: isGuest
        },
        callback: cb
      }).unwrap()
    } else {
      await deactivateNetwork({ params: {
        venueId,
        serviceId,
        wifiNetworkId: networkId
      }, callback: cb }).unwrap()
    }
  }

  return {
    addEdgeSdLan: addSdLan,
    editEdgeSdLan: editSdLan,
    toggleNetwork
  }
}

export interface SdLanScopedVenueNetworksData {
  sdLans: EdgeMvSdLanViewData[] | EdgeSdLanViewDataP2[] | undefined,
  scopedNetworkIds: string[],
  scopedGuestNetworkIds: string[]
}
export const useSdLanScopedVenueNetworks = (
  venueId: string | undefined,
  networkIds: string[] | undefined,
  refetchFnRef?: React.MutableRefObject<{ [key: string]: () => void }>
) => {
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeMvSdLanReady = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  const { data, refetch, isUninitialized } = useGetEdgeSdLanP2ViewDataListQuery({
    payload: {
      filters: isEdgeMvSdLanReady
        ? { 'tunneledWlans.venueId': [venueId] }
        : { networkIds, venueId: [venueId] },
      fields: [
        'id',
        'name',
        'venueId',
        'isGuestTunnelEnabled',
        ...(isEdgeSdLanHaReady
          ? ['edgeClusterId', 'edgeClusterName', 'guestEdgeClusterId', 'guestEdgeClusterName']
          : ['edgeId', 'edgeName']),
        ...(isEdgeMvSdLanReady
          ? ['tunneledWlans', 'tunneledGuestWlans']
          : ['networkIds', 'guestNetworkIds'])
      ],
      pageSize: 10000
    }
  }, {
    skip: !venueId || !networkIds || !(isEdgeSdLanReady || isEdgeSdLanHaReady)
  })

  if(refetchFnRef && !isUninitialized) refetchFnRef.current.sdlan = refetch

  const result = useMemo(() => {
    if (isEdgeMvSdLanReady) {
      const mvSdlan = (data?.data as EdgeMvSdLanViewData[])?.[0]

      return {
        sdLans: mvSdlan ? [mvSdlan] : [],
        scopedNetworkIds: mvSdlan?.tunneledWlans?.map(wlan => wlan.networkId) ?? [],
        scopedGuestNetworkIds: mvSdlan?.tunneledGuestWlans?.map(wlan => wlan.networkId) ?? []
      } as SdLanScopedVenueNetworksData
    } else {
      const sdlans = data?.data as EdgeSdLanViewDataP2[]
      return {
        sdLans: sdlans,
        scopedNetworkIds: uniq(flatMap(sdlans, (item) => item.networkIds)),
        scopedGuestNetworkIds: uniq(flatMap(sdlans, (item) =>
          item.isGuestTunnelEnabled ? item.guestNetworkIds : undefined)).filter(i => !!i)
      } as SdLanScopedVenueNetworksData
    }
  }, [data])

  return result
}

export interface SdLanScopedNetworkVenuesData {
    sdLansVenueMap: { [venueId in string]: EdgeMvSdLanViewData[] | EdgeSdLanViewDataP2[] },
    networkVenueIds: string[] | undefined,
    guestNetworkVenueIds: string[] | undefined
}
export const useSdLanScopedNetworkVenues = (
  networkId: string | undefined,
  refetchFnRef?: React.MutableRefObject<{ [key: string]: () => void }>
) => {
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeMvSdLanReady = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  const { data, refetch, isUninitialized } = useGetEdgeSdLanP2ViewDataListQuery({
    payload: {
      filters: isEdgeMvSdLanReady
        ? { 'tunneledWlans.networkId': [networkId] }
        : { networkIds: [networkId] },
      fields: [
        'id',
        'name',
        'venueId',
        'isGuestTunnelEnabled',
        ...(isEdgeSdLanHaReady
          ? ['edgeClusterId', 'edgeClusterName', 'guestEdgeClusterId', 'guestEdgeClusterName']
          : ['edgeId', 'edgeName']),
        ...(isEdgeMvSdLanReady
          ? ['tunneledWlans', 'tunneledGuestWlans']
          : ['guestNetworkIds'])
      ],
      pageSize: 10000
    }
  }, {
    skip: !networkId || !(isEdgeSdLanReady || isEdgeSdLanHaReady || isEdgeMvSdLanReady)
  })

  if (refetchFnRef && !isUninitialized) refetchFnRef.current.sdlan = refetch

  const result = useMemo(() => {
    if (isEdgeMvSdLanReady) {
      const mvSdlans = data?.data as EdgeMvSdLanViewData[]
      const sdLansVenueMap: { [venueId in string]: (EdgeSdLanViewDataP2 | EdgeMvSdLanViewData)[] } = {}
      const guestNetworkVenueIds: string[] = []

      mvSdlans?.forEach(sdlan => {
        const wlans = sdlan.tunneledWlans?.filter(wlan => wlan.networkId === networkId)
        wlans?.forEach(wlan => {
          if (!sdLansVenueMap[wlan.venueId]) sdLansVenueMap[wlan.venueId] = []

          sdLansVenueMap[wlan.venueId].push(sdlan)
        })

        guestNetworkVenueIds.push(...(uniq(sdlan.isGuestTunnelEnabled
          ? (sdlan.tunneledGuestWlans
            ?.filter(wlan => wlan.networkId === networkId)?.map(i => i.venueId))
          : [])
        ))
      })

      return {
        sdLansVenueMap,
        networkVenueIds: Object.keys(sdLansVenueMap),
        guestNetworkVenueIds
      } as SdLanScopedNetworkVenuesData
    } else {
      return {
        sdLansVenueMap: groupBy(data?.data, 'venueId'),
        networkVenueIds: data?.data?.map(item => item.venueId),
        guestNetworkVenueIds: data?.data
          ?.map(item =>
            item.isGuestTunnelEnabled && item.guestNetworkIds.includes(networkId??'') ? item.venueId : undefined)
          .filter(i => !!i)
      } as SdLanScopedNetworkVenuesData
    }

  }, [data?.data, networkId])

  return result
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

    if (intersection(scopedIds, selectedIds).length > 0) {
      showActionModal({
        type: 'confirm',
        title: $t({ defaultMessage: 'Deactivate network' }),
        content: selectedIds!.length === 1
          ? $t({ defaultMessage: 'This network is running the SD-LAN service on this <venueSingular></venueSingular>. Are you sure you want to deactivate it?' })
          : $t({ defaultMessage: 'The SD-LAN service is running on one or some of the selected <venuePlural></venuePlural>. Are you sure you want to deactivate?' }),
        okText: $t({ defaultMessage: 'Deactivate' }),
        onOk: () => {
          cb()
        }
      })
    } else {
      cb()
    }
  }

// id: is `serialNumber` when SD_LAN HA FF off
//     means `clusterId` when SD_LAN HA FF on
export const useGetEdgeSdLanByEdgeOrClusterId = (id?: string) => {
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)

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
