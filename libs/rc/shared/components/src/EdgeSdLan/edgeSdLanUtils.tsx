import { transform } from 'lodash'

import { Features }                                                                            from '@acx-ui/feature-toggle'
import { EdgeMvSdLanExtended, EdgeMvSdLanFormModel, EdgeMvSdLanNetworks, EdgeSdLanViewDataP2 } from '@acx-ui/rc/utils'
import { TenantLink }                                                                          from '@acx-ui/react-router-dom'
import { getIntl }                                                                             from '@acx-ui/utils'

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