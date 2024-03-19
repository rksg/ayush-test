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
      const linkToDetail = isEdgeSdLanHaReady
        ? `devices/edge/cluster/${sdlan.edgeClusterId}/edit/cluster-details`
        : `/devices/edge/${sdlan.edgeId}/details/overview`

      return <TenantLink to={linkToDetail}>
        {isEdgeSdLanHaReady ? sdlan.edgeClusterName : sdlan.edgeName}
      </TenantLink>
    })

    return isTunneled
      ? $t({ defaultMessage: 'Tunneled ({clusterNames})' },
        { clusterNames: <Space size={5}>
          {clusterNames}
        </Space> })
      : $t({ defaultMessage: 'Local breakout' })
  }
}