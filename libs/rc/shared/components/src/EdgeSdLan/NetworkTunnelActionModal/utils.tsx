import { EdgeMvSdLanViewData } from '@acx-ui/rc/utils'

import { useEdgeMvSdLanActions } from '../useEdgeSdLanActions'

import { NetworkTunnelTypeEnum, NetworkTunnelActionModalProps, NetworkTunnelActionForm } from './types'

export const getTunnelType = (
  network: NetworkTunnelActionModalProps['network'],
  venueSdLanInfo?: EdgeMvSdLanViewData) => {
  const isSdLanTunneled = Boolean(venueSdLanInfo?.tunneledWlans?.find(wlan =>
    wlan.networkId === network?.id && wlan.venueId === network?.venueId))

  return isSdLanTunneled ? NetworkTunnelTypeEnum.SdLan : NetworkTunnelTypeEnum.None
}

export const useUpdateNetworkTunnelAction = () => {
  const { toggleNetwork } = useEdgeMvSdLanActions()

  const updateNetworkTunnel = async (
    formValues: NetworkTunnelActionForm,
    network: NetworkTunnelActionModalProps['network'] ,
    venueSdLanInfo?: EdgeMvSdLanViewData
  ) => {
    const networkId = network?.id
    const networkVenueId = network?.venueId
    if (!networkId || !networkVenueId || !venueSdLanInfo)
      return Promise.reject()

    const formTunnelType = formValues.tunnelType
    const sdLanTunneled = formTunnelType === NetworkTunnelTypeEnum.SdLan
    const sdLanTunnelGuest = formValues.sdLan?.isGuestTunnelEnabled

    const tunnelTypeInitVal = getTunnelType(network, venueSdLanInfo)

    // activate/deactivate SDLAN tunneling
    if (formTunnelType !== tunnelTypeInitVal) {
    // activate/deactivate network
      await toggleNetwork(
        venueSdLanInfo?.id!,
        networkVenueId,
        sdLanTunneled ? sdLanTunnelGuest : false,
        networkId!,
        sdLanTunneled
      )
    } else {
    // tunnelType still SDLAN
      if (tunnelTypeInitVal === NetworkTunnelTypeEnum.SdLan) {
        const isGuestTunnelEnabledInitState = !!venueSdLanInfo?.isGuestTunnelEnabled
        && Boolean(venueSdLanInfo?.tunneledGuestWlans?.find(wlan =>
          wlan.networkId === networkId && wlan.venueId === networkVenueId))

        // check if tunnel guest changed
        if(isGuestTunnelEnabledInitState !== sdLanTunnelGuest) {
          await toggleNetwork(
              venueSdLanInfo?.id!,
              networkVenueId,
              sdLanTunnelGuest,
              networkId!,
              sdLanTunneled
          )
        }
      }
    }
  }

  return updateNetworkTunnel
}