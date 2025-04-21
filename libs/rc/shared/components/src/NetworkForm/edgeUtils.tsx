/* eslint-disable @typescript-eslint/no-explicit-any, max-len */

import _, { cloneDeep, findIndex } from 'lodash'

import { useEdgeSdLanActions } from '@acx-ui/edge/components'
import { Features }            from '@acx-ui/feature-toggle'
import {
  EdgeMvSdLanViewData,
  NetworkTunnelSdLanAction,
  NetworkVenue,
  TunnelProfileViewData
} from '@acx-ui/rc/utils'

import { useEdgeMvSdLanActions }                          from '../EdgeSdLan/useEdgeSdLanActions'
import { NetworkTunnelActionForm, NetworkTunnelTypeEnum } from '../NetworkTunnelActionModal/types'
import { getNetworkTunnelType }                           from '../NetworkTunnelActionModal/utils'
import { useIsEdgeFeatureReady }                          from '../useEdgeActions'

import type { NetworkTunnelActionModalProps } from '../NetworkTunnelActionModal'

export const TMP_NETWORK_ID = 'tmpNetworkId'
export interface NetworkVxLanTunnelProfileInfo {
  enableTunnel: boolean,
  enableVxLan: boolean,
  vxLanTunnels: TunnelProfileViewData[] | undefined
}

export const useUpdateEdgeSdLanActivations = () => {
  const { toggleNetwork } = useEdgeMvSdLanActions()
  const { toggleNetworkChange } = useEdgeSdLanActions()
  const isEdgeL2greReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  // eslint-disable-next-line max-len
  const updateEdgeSdLanActivations = async (networkId: string, updates: NetworkTunnelSdLanAction[], activatedVenues: NetworkVenue[]) => {
    const actions = updates.filter(item => {
      return _.find(activatedVenues, { venueId: item.venueId })
    }).map((actInfo) => {
      const originFwdTunnelId = (actInfo?.venueSdLanInfo?.tunneledWlans || [])
        ?.find(item => item.venueId === actInfo.venueId && item.networkId === networkId)
        ?.forwardingTunnelProfileId
      return isEdgeL2greReady?
        toggleNetworkChange(actInfo.serviceId, actInfo.venueId, networkId,
          actInfo.forwardingTunnelProfileId,
          originFwdTunnelId)
        :toggleNetwork(actInfo.serviceId, actInfo.venueId, networkId, actInfo.enabled, actInfo.enabled && actInfo.guestEnabled)
    })

    return await Promise.all(actions)
  }

  return updateEdgeSdLanActivations
}


export const getNetworkTunnelSdLanUpdateData = (
  modalFormValues: NetworkTunnelActionForm,
  sdLanAssociationUpdates: NetworkTunnelSdLanAction[],
  networkInfo: NetworkTunnelActionModalProps['network'],
  venueSdLanInfo: EdgeMvSdLanViewData
) => {
  // networkId is undefined in Add mode.
  const networkId = networkInfo?.id ?? TMP_NETWORK_ID
  const networkVenueId = networkInfo?.venueId

  const formTunnelType = modalFormValues.tunnelType
  const sdLanTunneled = formTunnelType === NetworkTunnelTypeEnum.SdLan
  const sdLanTunnelGuest = modalFormValues.sdLan?.isGuestTunnelEnabled
  const forwardingTunnelProfileId = modalFormValues.sdLan?.forwardingTunnelProfileId
  const forwardingTunnelType = modalFormValues.sdLan?.forwardingTunnelType

  const tunnelTypeInitVal = getNetworkTunnelType(networkInfo, [], venueSdLanInfo)
  const isFwdGuest = sdLanTunneled ? sdLanTunnelGuest : false
  let isNeedUpdate: boolean = false

  // activate/deactivate SDLAN tunneling
  if (formTunnelType !== tunnelTypeInitVal) {
    // activate/deactivate network
    isNeedUpdate = true
  } else {
  // tunnelType still SDLAN
    if (tunnelTypeInitVal === NetworkTunnelTypeEnum.SdLan) {
      const isGuestTunnelEnabledInitState = !!venueSdLanInfo?.isGuestTunnelEnabled
      && Boolean(venueSdLanInfo?.tunneledGuestWlans?.find(wlan =>
        wlan.networkId === networkId && wlan.venueId === networkVenueId))

      // check if tunnel guest changed
      if(isGuestTunnelEnabledInitState !== sdLanTunnelGuest) {

        // activate/deactivate network
        isNeedUpdate = true
      }
    }
  }

  if (!isNeedUpdate)
    return

  const updateContent = cloneDeep(sdLanAssociationUpdates as NetworkTunnelSdLanAction[]) ?? []

  // eslint-disable-next-line max-len
  const existDataIdx = findIndex(updateContent, { serviceId: venueSdLanInfo?.id, venueId: networkVenueId })

  if (existDataIdx !== -1) {
    updateContent[existDataIdx].guestEnabled = isFwdGuest
    updateContent[existDataIdx].enabled = sdLanTunneled
    updateContent[existDataIdx].forwardingTunnelProfileId = forwardingTunnelProfileId
    updateContent[existDataIdx].forwardingTunnelType = forwardingTunnelType
  } else {
    updateContent.push({
      serviceId: venueSdLanInfo?.id!,
      venueId: networkVenueId,
      guestEnabled: isFwdGuest,
      networkId: networkId,
      enabled: sdLanTunneled,
      forwardingTunnelProfileId: forwardingTunnelProfileId,
      forwardingTunnelType: forwardingTunnelType,
      venueSdLanInfo
    } as NetworkTunnelSdLanAction)
  }

  return updateContent
}