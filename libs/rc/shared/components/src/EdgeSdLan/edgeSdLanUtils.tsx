import { Space } from 'antd'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { EdgeSdLanViewDataP2 }    from '@acx-ui/rc/utils'
import { TenantLink }             from '@acx-ui/react-router-dom'
import { getIntl }                from '@acx-ui/utils'

export const useGetNetworkTunnelInfo = () => {
  const isEdgeSdLanHaReady = useIsSplitOn(Features.EDGES_SD_LAN_HA_TOGGLE)

  return (sdLansInfo?: EdgeSdLanViewDataP2[]) => {
    const { $t } = getIntl()
    const isTunneled = !!sdLansInfo?.length

    const clusterNames = sdLansInfo?.map(sdlan => {
      if (!isEdgeSdLanHaReady) {
        return <TenantLink to={`/devices/edge/${sdlan.edgeId}/details/overview`} key={sdlan.id}>
          {sdlan.edgeName}
        </TenantLink>
      }

      const isDmz = sdlan.isGuestTunnelEnabled
      const targetClusterId = isDmz
        ? sdlan.guestEdgeClusterId
        : sdlan.edgeClusterId

      const linkToDetail = `devices/edge/cluster/${targetClusterId}/edit/cluster-details`

      return <TenantLink to={linkToDetail} key={sdlan.id}>
        {isDmz ? sdlan.guestEdgeClusterName : sdlan.edgeClusterName}
      </TenantLink>
    })

    return isTunneled
      ? $t({ defaultMessage: 'Tunneled ({clusterNames})' },
        { clusterNames: <Space size={5}>
          {clusterNames}
        </Space> })
      : $t({ defaultMessage: 'Local Breakout' })
  }
}