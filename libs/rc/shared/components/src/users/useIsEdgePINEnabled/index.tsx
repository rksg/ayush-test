import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'


export function useIsEdgePINEnabled (): boolean {
  const isEdgeReady = useIsTierAllowed(TierFeatures.SMART_EDGES)
  const isPINReady = useIsSplitOn(Features.EDGE_PIN_HA_TOGGLE)

  return isEdgeReady && isPINReady
}
