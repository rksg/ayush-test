import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { EdgeSdLanViewDataP2 }    from '@acx-ui/rc/utils'
import { TenantLink }             from '@acx-ui/react-router-dom'
import { getIntl }                from '@acx-ui/utils'

export const useGetNetworkTunnelInfo = () => {
  const isEdgeSdLanHaReady = useIsSplitOn(Features.EDGES_SD_LAN_HA_TOGGLE)

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