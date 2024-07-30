import { EdgeMvSdLanViewData } from '@acx-ui/rc/utils'

import { isGuestTunnelUtilized } from '../EdgeSdLan/edgeSdLanUtils'
import { useEdgeMvSdLanActions } from '../EdgeSdLan/useEdgeSdLanActions'

import { NetworkTunnelTypeEnum, NetworkTunnelActionModalProps, NetworkTunnelActionForm } from './types'

export const getNetworkTunnelType = (
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

    const tunnelTypeInitVal = getNetworkTunnelType(network, venueSdLanInfo)

    // activate/deactivate SDLAN tunneling
    if (formTunnelType !== tunnelTypeInitVal) {
    // activate/deactivate network
      return await toggleNetwork(
        venueSdLanInfo?.id!,
        networkVenueId,
        sdLanTunneled ? sdLanTunnelGuest : false,
        networkId!,
        sdLanTunneled
      )
    } else {
    // tunnelType still SDLAN
      if (tunnelTypeInitVal === NetworkTunnelTypeEnum.SdLan) {
        // eslint-disable-next-line max-len
        const isGuestTunnelUtilizedInitState = isGuestTunnelUtilized(venueSdLanInfo, networkId, networkVenueId)

        // check if tunnel guest changed
        if(isGuestTunnelUtilizedInitState !== sdLanTunnelGuest) {
          return await toggleNetwork(
              venueSdLanInfo?.id!,
              networkVenueId,
              sdLanTunnelGuest,
              networkId!,
              sdLanTunneled
          )
        }
      }
    }

    return Promise.resolve()
  }

  return updateNetworkTunnel
}