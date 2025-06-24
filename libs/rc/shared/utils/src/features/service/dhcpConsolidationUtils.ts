import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { ServiceType }           from '../../constants'
import { useIsEdgeFeatureReady } from '../edge'

function useIsDhcpConsolidationEnabled (): boolean {
  const isMdnsProxyConsolidationEnabled = useIsSplitOn(Features.DHCP_CONSOLIDATION)
  const isEdgeDhcpEnabled = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)

  return isMdnsProxyConsolidationEnabled && isEdgeDhcpEnabled
}

interface DhcpStateMap {
  [ServiceType.DHCP]: boolean
  [ServiceType.EDGE_DHCP]: boolean
  [ServiceType.DHCP_CONSOLIDATION]: boolean
}
export function useDhcpStateMap (): DhcpStateMap {
  const isEdgeDhcpEnabled = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isConsolidationEnabled = useIsDhcpConsolidationEnabled()

  return {
    [ServiceType.DHCP]: !isConsolidationEnabled,
    [ServiceType.EDGE_DHCP]: isEdgeDhcpEnabled && !isConsolidationEnabled,
    [ServiceType.DHCP_CONSOLIDATION]: isConsolidationEnabled
  }
}
