import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { useIsEdgeFeatureReady } from '../edge'

export function useIsMdnsProxyConsolidationEnabled (): boolean {
  const isMdnsProxyConsolidationEnabled = useIsSplitOn(Features.MDNS_PROXY_CONSOLIDATION)
  const isEdgeMdnsReady = useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE)

  return isMdnsProxyConsolidationEnabled && isEdgeMdnsReady
}
