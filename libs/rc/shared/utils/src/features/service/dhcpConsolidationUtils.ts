import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { ServiceType }           from '../../constants'
import { useIsEdgeFeatureReady } from '../edge'

function useIsEdgeDhcpEnabled () {
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  return isEdgeHaReady && isEdgeDhcpHaReady
}

function useIsDhcpConsolidationEnabled (): boolean {
  const isMdnsProxyConsolidationEnabled = useIsSplitOn(Features.DHCP_CONSOLIDATION)
  const isEdgeDhcpEnabled = useIsEdgeDhcpEnabled()

  return isMdnsProxyConsolidationEnabled && isEdgeDhcpEnabled
}

interface DhcpStateMap {
  [ServiceType.DHCP]: boolean
  [ServiceType.EDGE_DHCP]: boolean
  [ServiceType.DHCP_CONSOLIDATION]: boolean
}
export function useDhcpStateMap (): DhcpStateMap {
  const isEdgeDhcpEnabled = useIsEdgeDhcpEnabled()
  const isConsolidationEnabled = useIsDhcpConsolidationEnabled()

  return {
    [ServiceType.DHCP]: !isConsolidationEnabled,
    [ServiceType.EDGE_DHCP]: isEdgeDhcpEnabled && !isConsolidationEnabled,
    [ServiceType.DHCP_CONSOLIDATION]: isConsolidationEnabled
  }
}
