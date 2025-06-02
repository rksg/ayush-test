import { Features }                                     from '@acx-ui/feature-toggle'
import { useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'

export const useIsEdgeReady = () => {
  return useIsSplitOn(Features.EDGES_TOGGLE)
}

export const useIsEdgeFeatureReady = (featureFlagKey: Features) => {
  const isEdgeEnabled = useIsEdgeReady()
  const isEdgeFeatureReady = useIsSplitOn(featureFlagKey)
  const isEdgeAdvEnabled = useIsTierAllowed(TierFeatures.EDGE_ADV)
  const isEdgeAvReportEnabled = useIsTierAllowed(TierFeatures.EDGE_AV_REPORT)
  const isEdgeNatTEnabled = useIsTierAllowed(TierFeatures.EDGE_NAT_T)
  const isEdgeArpTerminationEnabled = useIsTierAllowed(TierFeatures.EDGE_ARPT)
  const isEdgeMdnsProxyEnabled = useIsTierAllowed(TierFeatures.EDGE_MDNS_PROXY)
  const isEdgeHqosEnabled = useIsTierAllowed(TierFeatures.EDGE_HQOS)
  const isEdgeL2oGREEnabled = useIsTierAllowed(TierFeatures.EDGE_L2OGRE)
  const isEdgeMultiNatIpEnabled = useIsTierAllowed(TierFeatures.EDGE_NAT_IP_POOL)

  const isEnabledWithBooleanFlag = isEdgeEnabled && isEdgeFeatureReady
  switch(featureFlagKey) {
    case Features.EDGE_PIN_HA_TOGGLE:
    case Features.EDGE_PIN_ENHANCE_TOGGLE:
      return isEnabledWithBooleanFlag && isEdgeAdvEnabled
    case Features.EDGE_AV_REPORT_TOGGLE:
      return isEnabledWithBooleanFlag && isEdgeAvReportEnabled
    case Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE:
      return isEnabledWithBooleanFlag && isEdgeNatTEnabled
    case Features.EDGE_ARPT_TOGGLE:
      return isEnabledWithBooleanFlag && isEdgeArpTerminationEnabled
    case Features.EDGE_MDNS_PROXY_TOGGLE:
      return isEnabledWithBooleanFlag && isEdgeMdnsProxyEnabled
    case Features.EDGE_QOS_TOGGLE:
      return isEnabledWithBooleanFlag && isEdgeHqosEnabled
    case Features.EDGE_L2OGRE_TOGGLE:
      return isEnabledWithBooleanFlag && isEdgeL2oGREEnabled
    case Features.EDGE_MULTI_NAT_IP_TOGGLE:
      return isEnabledWithBooleanFlag && isEdgeMultiNatIpEnabled
    default:
      return isEnabledWithBooleanFlag
  }
}
