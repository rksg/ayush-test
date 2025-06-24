import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { ServiceType }           from '../../constants'
import { useIsEdgeFeatureReady } from '../edge'

function useIsMdnsProxyConsolidationEnabled (): boolean {
  const isMdnsProxyConsolidationEnabled = useIsSplitOn(Features.MDNS_PROXY_CONSOLIDATION)
  const isEdgeMdnsReady = useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE)

  return isMdnsProxyConsolidationEnabled && isEdgeMdnsReady
}

interface MdnsProxyStateMap {
  [ServiceType.MDNS_PROXY]: boolean
  [ServiceType.EDGE_MDNS_PROXY]: boolean
  [ServiceType.MDNS_PROXY_CONSOLIDATION]: boolean
}
export function useMdnsProxyStateMap (): MdnsProxyStateMap {
  const isEdgeMdnsReady = useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE)
  const isConsolidationEnabled = useIsMdnsProxyConsolidationEnabled()

  return {
    [ServiceType.MDNS_PROXY]: !isConsolidationEnabled,
    [ServiceType.EDGE_MDNS_PROXY]: isEdgeMdnsReady && !isConsolidationEnabled,
    [ServiceType.MDNS_PROXY_CONSOLIDATION]: isConsolidationEnabled
  }
}
