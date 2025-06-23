import { Features }                                     from '@acx-ui/feature-toggle'
import { useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'

export const useIsEdgeFeatureReady = (featureFlagKey: Features) => {
  const isEdgeFeatureReady = useIsSplitOn(featureFlagKey)
  const isEdgeAdvEnabled = useIsTierAllowed(TierFeatures.EDGE_ADV)
  const isEdgeAvReportEnabled = useIsTierAllowed(TierFeatures.EDGE_AV_REPORT)
  const isEdgeNatTEnabled = useIsTierAllowed(TierFeatures.EDGE_NAT_T)
  const isEdgeArpTerminationEnabled = useIsTierAllowed(TierFeatures.EDGE_ARPT)
  const isEdgeMdnsProxyEnabled = useIsTierAllowed(TierFeatures.EDGE_MDNS_PROXY)
  const isEdgeHqosEnabled = useIsTierAllowed(TierFeatures.EDGE_HQOS)
  const isEdgeL2oGREEnabled = useIsTierAllowed(TierFeatures.EDGE_L2OGRE)
  const isEdgeMultiNatIpEnabled = useIsTierAllowed(TierFeatures.EDGE_NAT_IP_POOL)
  const isEdgeMultiWanEnabled = useIsTierAllowed(TierFeatures.EDGE_DUAL_WAN)

  switch(featureFlagKey) {
    case Features.EDGE_PIN_HA_TOGGLE:
    case Features.EDGE_PIN_ENHANCE_TOGGLE:
      return isEdgeFeatureReady && isEdgeAdvEnabled
    case Features.EDGE_AV_REPORT_TOGGLE:
      return isEdgeFeatureReady && isEdgeAvReportEnabled
    case Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE:
      return isEdgeFeatureReady && isEdgeNatTEnabled
    case Features.EDGE_ARPT_TOGGLE:
      return isEdgeFeatureReady && isEdgeArpTerminationEnabled
    case Features.EDGE_MDNS_PROXY_TOGGLE:
      return isEdgeFeatureReady && isEdgeMdnsProxyEnabled
    case Features.EDGE_QOS_TOGGLE:
      return isEdgeFeatureReady && isEdgeHqosEnabled
    case Features.EDGE_L2OGRE_TOGGLE:
      return isEdgeFeatureReady && isEdgeL2oGREEnabled
    case Features.EDGE_MULTI_NAT_IP_TOGGLE:
      return isEdgeFeatureReady && isEdgeMultiNatIpEnabled
    case Features.EDGE_DUAL_WAN_TOGGLE:
      return isEdgeFeatureReady && isEdgeMultiWanEnabled
    default:
      return isEdgeFeatureReady
  }
}
