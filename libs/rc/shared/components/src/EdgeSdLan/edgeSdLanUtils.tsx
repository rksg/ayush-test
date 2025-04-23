import { groupBy, isNil, transform } from 'lodash'

import { showActionModal }                                                                                                                                 from '@acx-ui/components'
import { Features }                                                                                                                                        from '@acx-ui/feature-toggle'
import { EdgeMvSdLanExtended, EdgeMvSdLanFormModel, EdgeMvSdLanNetworks, EdgeMvSdLanViewData, EdgeSdLanTunneledWlan, EdgeSdLanViewDataP2, TunnelTypeEnum } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                                      from '@acx-ui/react-router-dom'
import { getIntl }                                                                                                                                         from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'


export const useGetNetworkTunnelInfo = () => {
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)

  return (networkId: string, sdLanInfo?: EdgeSdLanViewDataP2) => {
    const { $t } = getIntl()
    const isTunneled = !!sdLanInfo
    if (!isTunneled) return $t({ defaultMessage: 'Local Breakout' })

    let clusterName
    if(!isEdgeSdLanHaReady) {
      clusterName = <TenantLink to={`/devices/edge/${sdLanInfo.edgeId}/details/overview`}>
        {sdLanInfo.edgeName}
      </TenantLink>
    } else {
      const isDmzEnabled = sdLanInfo.isGuestTunnelEnabled
      const isTunnelDmz = isDmzEnabled && sdLanInfo.guestNetworkIds?.includes(networkId)
      const targetClusterId = isTunnelDmz
        ? sdLanInfo.guestEdgeClusterId
        : sdLanInfo.edgeClusterId

      const linkToDetail = `devices/edge/cluster/${targetClusterId}/edit/cluster-details`

      clusterName = <TenantLink to={linkToDetail}>
        {isTunnelDmz ? sdLanInfo.guestEdgeClusterName : sdLanInfo.edgeClusterName}
      </TenantLink>
    }

    return $t({ defaultMessage: 'Tunneled ({clusterName})' },
      { clusterName })
  }
}

export const edgeSdLanFormRequestPreProcess = (formData: EdgeMvSdLanFormModel) => {
  const payload = {
    name: formData.name,
    venueId: formData.venueId,
    edgeClusterId: formData.edgeClusterId,
    networks: transform(formData.activatedNetworks, (result, value, key) => {
      result[key] = value.map(v => v.id)
    }, {} as EdgeMvSdLanNetworks),
    tunnelProfileId: formData.tunnelProfileId,
    isGuestTunnelEnabled: formData.isGuestTunnelEnabled
  } as EdgeMvSdLanExtended

  if (formData.isGuestTunnelEnabled) {
    payload.guestEdgeClusterId = formData.guestEdgeClusterId
    payload.guestEdgeClusterVenueId = formData.guestEdgeClusterVenueId
    payload.guestTunnelProfileId = formData.guestTunnelProfileId
    payload.guestNetworks = transform(formData.activatedGuestNetworks, (result, value, key) => {
      result[key] = value.map(v => v.id)
    }, {} as EdgeMvSdLanNetworks)
  }

  return payload
}

export const isDmzTunnelUtilized = (
  venueSdLanInfo?: EdgeMvSdLanViewData,
  networkId?: string,
  networkVenueId?: string
): boolean => {

  const isDmzTunnelUtilized =
  (!!venueSdLanInfo?.isGuestTunnelEnabled
        && Boolean(venueSdLanInfo?.tunneledGuestWlans?.find(wlan =>
          wlan.networkId === networkId && wlan.venueId === networkVenueId)))
  || Boolean(!!venueSdLanInfo?.tunneledWlans?.find(wlan =>
    wlan.networkId === networkId
    && wlan.venueId === networkVenueId
    && wlan?.forwardingTunnelType === TunnelTypeEnum.VXLAN_GPE))
  return isDmzTunnelUtilized
        && !!networkId && !!networkVenueId
}

export const isSdLanDmzUtilizedOnDiffVenue = (
  venueSdLanInfo: EdgeMvSdLanViewData,
  networkId: string,
  networkVenueId: string,
  currentFwdTunnelType: TunnelTypeEnum|string|undefined
): boolean => {
  if (venueSdLanInfo?.isGuestTunnelEnabled ||
    currentFwdTunnelType === TunnelTypeEnum.VXLAN_GPE
  ) {
    // should reference `tunneledWlans` since we need to consider both activate and deactivate scenario
    const otherDmzTunnel = venueSdLanInfo?.tunneledWlans?.find(wlan =>
      wlan.venueId !== networkVenueId && wlan.networkId === networkId)

    return Boolean(otherDmzTunnel)
  }

  return false
}

// eslint-disable-next-line max-len
export const transformSdLanScopedVenueMap = (sdLans?: EdgeMvSdLanViewData[]): Record<string, EdgeMvSdLanViewData> => {
  const resultMap:Record<string, EdgeMvSdLanViewData> = {}

  sdLans?.forEach(sdlan => {
    sdlan.tunneledWlans?.forEach(wlan => {
      if (isNil(resultMap[wlan.venueId])) {
        resultMap[wlan.venueId] = sdlan
      }
    })
  })

  return resultMap
}

// eslint-disable-next-line max-len
export const isSdLanLastNetworkInVenue = (tunneledWlans?: EdgeSdLanTunneledWlan[], venueId?: string) => {
  const grouped = groupBy(tunneledWlans, 'venueId')
  return venueId && grouped[venueId] ? grouped[venueId].length <= 1 : false
}

export const showSdLanVenueDissociateModal = (onOk: () => Promise<void>, onCancel?: () => void) => {
  const { $t } = getIntl()

  showActionModal({
    type: 'confirm',
    title: $t({ defaultMessage: 'SD-LAN Removal' }),
    content: $t({ defaultMessage:
      // eslint-disable-next-line max-len
      'The SD-LAN service at this <venueSingular></venueSingular> will be removed once the last network disassociates from it. Are you sure you want to continue?'
    }),
    okText: $t({ defaultMessage: 'Continue' }),
    onOk,
    onCancel
  })
}