import { cloneDeep, findIndex } from 'lodash'

import { EdgeMvSdLanViewData, EdgeSdLanTunneledWlan, NetworkTunnelSdLanAction } from '@acx-ui/rc/utils'

import { isGuestTunnelUtilized } from '../EdgeSdLan/edgeSdLanUtils'
import { useEdgeMvSdLanActions } from '../EdgeSdLan/useEdgeSdLanActions'

import { NetworkTunnelTypeEnum, NetworkTunnelActionForm } from './types'

import { NetworkTunnelActionModalProps } from '.'

export const getNetworkTunnelType = (
  network: NetworkTunnelActionModalProps['network'],
  softGreInfo: NetworkTunnelActionModalProps['cachedSoftGre'],
  venueSdLanInfo?: EdgeMvSdLanViewData
) => {
  const isSdLanTunneled = Boolean(venueSdLanInfo?.tunneledWlans?.find(wlan =>
    wlan.networkId === network?.id && wlan.venueId === network?.venueId))

  const isSoftGreTunneled = Boolean(softGreInfo?.find(sg =>
    sg.venueId === network?.venueId && sg.networkIds.includes(network?.id!)))

  return isSdLanTunneled ? NetworkTunnelTypeEnum.SdLan :
    (isSoftGreTunneled ? NetworkTunnelTypeEnum.SoftGre : NetworkTunnelTypeEnum.None)
}

export const useUpdateNetworkTunnelAction = () => {
  const { toggleNetwork } = useEdgeMvSdLanActions()

  const updateNetworkTunnel = async (
    formValues: NetworkTunnelActionForm,
    network: NetworkTunnelActionModalProps['network'] ,
    venueSdLanInfo?: EdgeMvSdLanViewData,
    otherSdLanActs?: () => Promise<void>
  ) => {
    const networkId = network?.id
    const networkVenueId = network?.venueId
    if (!networkId
      || !networkVenueId
      || !venueSdLanInfo
      || !venueSdLanInfo.tunneledWlans?.some(wlan => wlan.venueId === networkVenueId)
    ) {
      return Promise.reject()
    }

    const formTunnelType = formValues.tunnelType
    const sdLanTunneled = formTunnelType === NetworkTunnelTypeEnum.SdLan
    const sdLanTunnelGuest = formValues.sdLan?.isGuestTunnelEnabled

    const tunnelTypeInitVal = getNetworkTunnelType(network, [], venueSdLanInfo)

    const triggerSdLanOperations = async () => {
      await toggleNetwork(
        venueSdLanInfo?.id!,
        networkVenueId,
        networkId!,
        sdLanTunneled,
        sdLanTunneled && sdLanTunnelGuest
      )

      await otherSdLanActs?.()
    }

    // activate/deactivate SDLAN tunneling
    if (formTunnelType !== tunnelTypeInitVal) {
    // activate/deactivate network
      return await triggerSdLanOperations()
    } else {
    // tunnelType still SDLAN
      if (tunnelTypeInitVal === NetworkTunnelTypeEnum.SdLan) {
        // eslint-disable-next-line max-len
        const isGuestTunnelUtilizedInitState = isGuestTunnelUtilized(venueSdLanInfo, networkId, networkVenueId)

        // check if tunnel guest changed
        if(isGuestTunnelUtilizedInitState !== sdLanTunnelGuest) {
          return await triggerSdLanOperations()
        }
      }
    }

    return Promise.resolve()
  }

  return updateNetworkTunnel
}

// eslint-disable-next-line max-len
export const mergeSdLanCacheAct = (venueSdLanInfo: EdgeMvSdLanViewData, cachedActs: NetworkTunnelSdLanAction[]): EdgeMvSdLanViewData => {
  const updatedSdLan = cloneDeep(venueSdLanInfo)

  try {
    cachedActs.forEach((actInfo) => {
      // should skip actions which is for different venueSDLAN
      if (actInfo.serviceId !== venueSdLanInfo.id) return

      // eslint-disable-next-line max-len
      const idx = findIndex(updatedSdLan.tunneledWlans, { venueId: actInfo.venueId, networkId: actInfo.networkId })
      // eslint-disable-next-line max-len
      const guestIdx = findIndex(updatedSdLan.tunneledGuestWlans, { venueId: actInfo.venueId, networkId: actInfo.networkId })

      if (actInfo.enabled) {
        if (idx === -1) {
          updatedSdLan.tunneledWlans!.push({
            venueId: actInfo.venueId,
            networkId: actInfo.networkId
          } as EdgeSdLanTunneledWlan)
        }

        if (actInfo.guestEnabled) {
          if (guestIdx === -1) {
            updatedSdLan.tunneledGuestWlans!.push({
              venueId: actInfo.venueId,
              networkId: actInfo.networkId
            } as EdgeSdLanTunneledWlan)
          }
        } else {
          if (guestIdx !== -1) {
            updatedSdLan.tunneledGuestWlans!.splice(guestIdx, 1)
          }
        }
      } else {
        updatedSdLan.tunneledWlans!.splice(idx, 1)
        updatedSdLan.tunneledGuestWlans!.splice(guestIdx, 1)
      }
    })

  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
  }
  return updatedSdLan
}