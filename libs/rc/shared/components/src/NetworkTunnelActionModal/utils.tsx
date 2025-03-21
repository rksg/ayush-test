/* eslint-disable max-len */
import { cloneDeep, findIndex } from 'lodash'

import { Features }                                                                                                                from '@acx-ui/feature-toggle'
import { useGetEdgePinViewDataListQuery }                                                                                          from '@acx-ui/rc/services'
import { EdgeMvSdLanViewData, EdgeSdLanTunneledWlan, NetworkTunnelSdLanAction, NetworkTypeEnum, PersonalIdentityNetworksViewData } from '@acx-ui/rc/utils'
import { getIntl }                                                                                                                 from '@acx-ui/utils'

import { isGuestTunnelUtilized, isSdLanLastNetworkInVenue, showSdLanVenueDissociateModal } from '../EdgeSdLan/edgeSdLanUtils'
import { showSdLanGuestFwdConflictModal }                                                  from '../EdgeSdLan/SdLanGuestFwdConflictModal'
import { useEdgeMvSdLanActions }                                                           from '../EdgeSdLan/useEdgeSdLanActions'
import { useIsEdgeFeatureReady }                                                           from '../useEdgeActions'

import { NetworkTunnelActionModalProps }                  from './NetworkTunnelActionModal'
import { NetworkTunnelTypeEnum, NetworkTunnelActionForm } from './types'
import { useEdgeMvSdLanData }                             from './useEdgeMvSdLanData'
import { SoftGreNetworkTunnel, useSoftGreTunnelActions }  from './useSoftGreTunnelActions'


interface useTunnelInfosProps {
  network?: {
    id: string,
    type: NetworkTypeEnum,
    venueId: string,
  }
  cachedActs?: NetworkTunnelSdLanAction[]
  cachedSoftGre?: SoftGreNetworkTunnel[]
}
export const useTunnelInfos = (props: useTunnelInfosProps) => {
  const { network, cachedActs, cachedSoftGre } = props
  const isEdgePinHaEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)

  const networkVenueId = network?.venueId

  const {
    venueSdLan,
    networkVlanPool,
    isLoading: isSdLanLoading
  } = useEdgeMvSdLanData(network)

  let venueSdLanInfo = venueSdLan
  if (venueSdLan && cachedActs)
    venueSdLanInfo = mergeSdLanCacheAct(venueSdLan, cachedActs)

  const {
    venuePinInfo,
    isPinLoading
  } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id', 'name', 'tunneledWlans'],
      filters: { 'tunneledWlans.venueId': [networkVenueId!] }
    }
  }, {
    skip: !isEdgePinHaEnabled || !network,
    selectFromResult: ({ data, isLoading }) => {
      return {
        venuePinInfo: data?.data[0],
        isPinLoading: isLoading
      }
    }
  })

  const tunnelType = getNetworkTunnelType(network, cachedSoftGre, venueSdLanInfo, venuePinInfo)
  const tunnelData = tunnelType === NetworkTunnelTypeEnum.SdLan ? venueSdLanInfo
    : (tunnelType === NetworkTunnelTypeEnum.Pin
      ? venuePinInfo
      :(tunnelType === NetworkTunnelTypeEnum.SoftGre ? cachedSoftGre : undefined))

  return {
    isLoading: isSdLanLoading || isPinLoading,
    tunnelData,
    tunnelType,

    venueSdLanInfo,
    networkVlanPool,
    venuePinInfo
  }
}

export const getNetworkTunnelType = (
  network: NetworkTunnelActionModalProps['network'],
  softGreInfo?: NetworkTunnelActionModalProps['cachedSoftGre'],
  venueSdLanInfo?: EdgeMvSdLanViewData,
  venuePinInfo?: PersonalIdentityNetworksViewData
): NetworkTunnelTypeEnum => {
  const isSdLanTunneled = Boolean(venueSdLanInfo?.tunneledWlans?.find(wlan =>
    wlan.networkId === network?.id && wlan.venueId === network?.venueId))
    ? NetworkTunnelTypeEnum.SdLan : false

  const isPinTunneled = Boolean(venuePinInfo?.tunneledWlans?.find(wlan =>
    wlan.networkId === network?.id)) ? NetworkTunnelTypeEnum.Pin : false

  const isSoftGreTunneled = Boolean(softGreInfo?.find(sg =>
    sg.venueId === network?.venueId && sg.networkIds.includes(network?.id!))?.profileId)
    ? NetworkTunnelTypeEnum.SoftGre : false

  return isSdLanTunneled || isPinTunneled || isSoftGreTunneled || NetworkTunnelTypeEnum.None
}

export const getTunnelTypeDisplayText = (tunnelType: NetworkTunnelTypeEnum | undefined) => {
  const { $t } = getIntl()

  switch (tunnelType) {
    case NetworkTunnelTypeEnum.SdLan:
      return $t({ defaultMessage: 'SD-LAN' })
    case NetworkTunnelTypeEnum.SoftGre:
      return $t({ defaultMessage: 'SoftGRE' })
    case NetworkTunnelTypeEnum.Pin:
      return $t({ defaultMessage: 'PIN' })
    default:
      return ''
  }
}

export const useUpdateNetworkTunnelAction = () => {
  const { toggleNetwork } = useEdgeMvSdLanActions()

  const updateSdLanNetworkTunnel = async (
    formValues: NetworkTunnelActionForm,
    network: NetworkTunnelActionModalProps['network'],
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

export const useDeactivateNetworkTunnelByType = () => {
  const { dectivateSoftGreTunnel, deactivateIpSecOverSoftGre } = useSoftGreTunnelActions()
  const updateSdLanNetworkTunnel = useUpdateNetworkTunnelAction()

  const deactivateNetworkTunnelByType = (
    tunnelType: NetworkTunnelTypeEnum,
    formValues: NetworkTunnelActionForm,
    network: NetworkTunnelActionModalProps['network'],
    venueSdLanInfo?: EdgeMvSdLanViewData
  ) => {
    switch (tunnelType) {
      case NetworkTunnelTypeEnum.SdLan:
        updateSdLanNetworkTunnel(
          formValues,
          network,
          tunnelType,
          venueSdLanInfo
        )
        return
      case NetworkTunnelTypeEnum.SoftGre:
        if (formValues.ipsec && formValues.ipsec.enableIpsec) {
          deactivateIpSecOverSoftGre(network!.venueId, network!.id, formValues)
        } else {
          dectivateSoftGreTunnel(network!.venueId, network!.id, formValues)
        }
        return
      case NetworkTunnelTypeEnum.Pin:
      default:
        return
    }
  }

  return deactivateNetworkTunnelByType
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