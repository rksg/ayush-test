/* eslint-disable max-len */
import { cloneDeep, findIndex } from 'lodash'

import { EdgeMvSdLanViewData, EdgeSdLanTunneledWlan, NetworkTunnelSdLanAction, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { isGuestTunnelUtilized, isSdLanLastNetworkInVenue, showSdLanVenueDissociateModal } from '../EdgeSdLan/edgeSdLanUtils'
import { showSdLanGuestFwdConflictModal }                                                  from '../EdgeSdLan/SdLanGuestFwdConflictModal'
import { useEdgeMvSdLanActions }                                                           from '../EdgeSdLan/useEdgeSdLanActions'

import { NetworkTunnelTypeEnum, NetworkTunnelActionForm } from './types'

import { NetworkTunnelActionModalProps } from '.'

export const getNetworkTunnelType = (
  network: NetworkTunnelActionModalProps['network'],
  softGreInfo?: NetworkTunnelActionModalProps['cachedSoftGre'],
  venueSdLanInfo?: EdgeMvSdLanViewData
) => {
  const isSdLanTunneled = Boolean(venueSdLanInfo?.tunneledWlans?.find(wlan =>
    wlan.networkId === network?.id && wlan.venueId === network?.venueId))

  const isSoftGreTunneled = Boolean(softGreInfo?.find(sg =>
    sg.venueId === network?.venueId && sg.networkIds.includes(network?.id!))?.profileId)

  return isSdLanTunneled ? NetworkTunnelTypeEnum.SdLan :
    (isSoftGreTunneled ? NetworkTunnelTypeEnum.SoftGre : NetworkTunnelTypeEnum.None)
}

export const useUpdateNetworkTunnelAction = () => {
  const { toggleNetwork } = useEdgeMvSdLanActions()

  const updateSdLanNetworkTunnel = async (
    formValues: NetworkTunnelActionForm,
    network: NetworkTunnelActionModalProps['network'] ,
    tunnelTypeInitVal: NetworkTunnelTypeEnum,
    venueSdLanInfo?: EdgeMvSdLanViewData
  ) => {

    const formTunnelType = formValues.tunnelType
    if (tunnelTypeInitVal !== NetworkTunnelTypeEnum.SdLan && formTunnelType !== NetworkTunnelTypeEnum.SdLan) {
      return Promise.resolve()
    }

    const networkId = network?.id
    const networkVenueId = network?.venueId
    if (!networkId
      || !networkVenueId
      || !venueSdLanInfo
      || !venueSdLanInfo.tunneledWlans?.some(wlan => wlan.venueId === networkVenueId)
    ) {
      return Promise.reject()
    }

    const sdLanTunneled = formTunnelType === NetworkTunnelTypeEnum.SdLan
    const sdLanTunnelGuest = formValues.sdLan?.isGuestTunnelEnabled ?? false

    const triggerSdLanOperations = async () => {
      return await toggleNetwork(
        venueSdLanInfo?.id!,
        networkVenueId,
        networkId!,
        sdLanTunneled,
        sdLanTunneled && sdLanTunnelGuest
      )
    }

    // deactivate SDLAN tunneling
    if (formTunnelType !== NetworkTunnelTypeEnum.SdLan) {
      // is last network in Venue?
      if (isSdLanLastNetworkInVenue(venueSdLanInfo?.tunneledWlans, networkVenueId)) {
        return await new Promise<void | boolean>((resolve) => {
          showSdLanVenueDissociateModal(async () => {
            await triggerSdLanOperations()
            resolve()
          }, () => resolve(false))
        })
      } else {
        return await triggerSdLanOperations()
      }
    } else {
      // activate or still sdlan
      const isGuestTunnelUtilizedInitState = isGuestTunnelUtilized(venueSdLanInfo, networkId, networkVenueId)

      // if no changes
      if (formTunnelType === tunnelTypeInitVal && isGuestTunnelUtilizedInitState === sdLanTunnelGuest)
        return Promise.resolve()

      // check conflict when is CAPTIVEPORTAL network
      // and 1. still SDLAN and tunnel guest changed
      // or 2. activate SDLAN
      if(((formTunnelType === tunnelTypeInitVal && isGuestTunnelUtilizedInitState !== sdLanTunnelGuest)
      || (tunnelTypeInitVal !== NetworkTunnelTypeEnum.SdLan && formTunnelType === NetworkTunnelTypeEnum.SdLan))
      && network.type === NetworkTypeEnum.CAPTIVEPORTAL) {
        return await new Promise<void | boolean>((resolve) =>
          showSdLanGuestFwdConflictModal({
            currentNetworkVenueId: network?.venueId!,
            currentNetworkId: network?.id!,
            currentNetworkName: '',
            activatedGuest: formValues.sdLan.isGuestTunnelEnabled,
            tunneledWlans: venueSdLanInfo!.tunneledWlans,
            tunneledGuestWlans: venueSdLanInfo!.tunneledGuestWlans,
            onOk: async (impactVenueIds: string[]) => {
              if (impactVenueIds.length) {
                // has conflict and confirmed
                const actions = [triggerSdLanOperations()]
                actions.push(...impactVenueIds.map(impactVenueId =>
                  toggleNetwork(venueSdLanInfo?.id!, impactVenueId, network?.id!, true, formValues.sdLan.isGuestTunnelEnabled)))
                await Promise.all(actions)
              } else {
                await triggerSdLanOperations()
              }

              resolve()
            },
            onCancel: () => resolve(false)
          })
        )
      } else {
        return await triggerSdLanOperations()
      }
    }
  }

  return updateSdLanNetworkTunnel
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