import { useMemo } from 'react'

import { MessageDescriptor } from 'react-intl'

import { RadioCardCategory }                                                        from '@acx-ui/components'
import { Features, TierFeatures, useIsBetaEnabled, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { getUserProfile, isCoreTier }                                               from '@acx-ui/user'

import { ServiceType }                           from '../../constants'
import { PolicyType }                            from '../../types'
import { useIsEdgeFeatureReady, useIsEdgeReady } from '../edge'
import { policyTypeLabelMapping }                from '../policy'

import { UnifiedService, UnifiedServiceCategory, UnifiedServiceSourceType } from './constants'
import { buildUnifiedServices, isUnifiedServiceAvailable }                  from './utils'


type BaseAvailableUnifiedService = Pick<UnifiedService<MessageDescriptor>,
  'type' | 'sourceType' | 'products' | 'category' | 'disabled' |
  'isBetaFeature' | 'readonly' | 'searchKeywords'
> & { route?: string }

/*
  SYNC: When adding a Service or Policy definition here, ensure you also define
  the corresponding useQuery function in the useUnifiedServiceTotalCountMap to
  fetch the totalCount for accurate data retrieval.
*/
function useBaseAvailableUnifiedServicesList (): Array<BaseAvailableUnifiedService> {
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)

  // Service features
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const isPortalProfileEnabled = useIsSplitOn(Features.PORTAL_PROFILE_CONSOLIDATION_TOGGLE)
  const propertyManagementEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA) && !isCore
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeMdnsReady = useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE)
  const isEdgeTnmServiceReady = useIsEdgeFeatureReady(Features.EDGE_THIRDPARTY_MGMT_TOGGLE)
  const isEdgeOltEnabled = useIsSplitOn(Features.EDGE_NOKIA_OLT_MGMT_TOGGLE)
  const isEdgeMdnsBetaEnabled = useIsBetaEnabled(TierFeatures.EDGE_MDNS_PROXY)

  // Policy features
  const supportHotspot20R1 = useIsSplitOn(Features.WIFI_FR_HOTSPOT20_R1_TOGGLE)
  const isLbsFeatureEnabled = useIsSplitOn(Features.WIFI_EDA_LBS_TOGGLE)
  const isLbsFeatureTierAllowed = useIsTierAllowed(TierFeatures.LOCATION_BASED_SERVICES)
  const supportLbs = isLbsFeatureEnabled && isLbsFeatureTierAllowed && !isCore
  const isEdgeEnabled = useIsEdgeReady()
  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)
  const cloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isWorkflowTierEnabled = useIsTierAllowed(Features.WORKFLOW_ONBOARD)
  const isWorkflowFFEnabled = useIsSplitOn(Features.WORKFLOW_TOGGLE) && !isCore
  const isCertificateTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isEdgeHqosEnabled = useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE)
  const isEdgeHqosBetaEnabled = useIsBetaEnabled(TierFeatures.EDGE_HQOS)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  // eslint-disable-next-line
  const isDirectoryServerEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_DIRECTORY_SERVER_TOGGLE)
  const isSwitchPortProfileEnabled = useIsSplitOn(Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)
  const isIpsecEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const isCaptivePortalSsoSamlEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_SSO_SAML_TOGGLE)
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

  return useMemo<Array<BaseAvailableUnifiedService>>(() => {
    const baseUnifiedServiceList = [
      {
        type: PolicyType.AAA,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY
      },
      {
        type: PolicyType.ACCESS_CONTROL_CONSOLIDATION,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH],
        category: UnifiedServiceCategory.SECURITY_ACCESS_CONTROL,
        searchKeywords: [
          policyTypeLabelMapping[PolicyType.LAYER_2_POLICY],
          policyTypeLabelMapping[PolicyType.LAYER_3_POLICY],
          policyTypeLabelMapping[PolicyType.DEVICE_POLICY],
          policyTypeLabelMapping[PolicyType.APPLICATION_POLICY]
        ],
        route: '/policies/accessControl/wifi',
        disabled: !isSwitchMacAclEnabled
      },
      {
        type: PolicyType.ACCESS_CONTROL,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.SECURITY_ACCESS_CONTROL,
        searchKeywords: [
          policyTypeLabelMapping[PolicyType.LAYER_2_POLICY],
          policyTypeLabelMapping[PolicyType.LAYER_3_POLICY],
          policyTypeLabelMapping[PolicyType.DEVICE_POLICY],
          policyTypeLabelMapping[PolicyType.APPLICATION_POLICY]
        ],
        disabled: isSwitchMacAclEnabled
      },
      {
        type: PolicyType.ADAPTIVE_POLICY,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.SECURITY_ACCESS_CONTROL,
        disabled: !cloudpathBetaEnabled
      },
      {
        type: PolicyType.CERTIFICATE_TEMPLATE,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
        disabled: !isCertificateTemplateEnabled
      },
      {
        type: PolicyType.CLIENT_ISOLATION,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.SECURITY_ACCESS_CONTROL
      },
      {
        type: PolicyType.CONNECTION_METERING,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
        category: UnifiedServiceCategory.MONITORING_TROUBLESHOOTING,
        disabled: !isConnectionMeteringEnabled
      },
      {
        type: PolicyType.DIRECTORY_SERVER,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
        disabled: !isDirectoryServerEnabled
      },
      {
        type: PolicyType.ETHERNET_PORT_PROFILE,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.NETWORK_SERVICES,
        disabled: !isEthernetPortProfileEnabled || isSwitchPortProfileEnabled
      },
      {
        type: PolicyType.FLEX_AUTH,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.SWITCH],
        category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
        disabled: !isSwitchFlexAuthEnabled
      },
      {
        type: PolicyType.HQOS_BANDWIDTH,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.EDGE],
        category: UnifiedServiceCategory.NETWORK_SERVICES,
        disabled: !isEdgeHqosEnabled,
        isBetaFeature: isEdgeHqosBetaEnabled
      },
      {
        type: PolicyType.IDENTITY_PROVIDER,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
        disabled: !supportHotspot20R1 || isCaptivePortalSsoSamlEnabled
      },
      {
        type: PolicyType.IPSEC,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.SECURITY_ACCESS_CONTROL,
        disabled: !isIpsecEnabled
      },
      {
        type: PolicyType.LBS_SERVER_PROFILE,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.NETWORK_SERVICES,
        disabled: !supportLbs
      },
      {
        type: PolicyType.MAC_REGISTRATION_LIST,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
        disabled: !cloudpathBetaEnabled
      },
      {
        type: PolicyType.PORT_PROFILE,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH],
        category: UnifiedServiceCategory.NETWORK_SERVICES,
        disabled: !isSwitchPortProfileEnabled,
        route: '/policies/portProfile/wifi'
      },
      {
        type: PolicyType.ROGUE_AP_DETECTION,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.SECURITY_ACCESS_CONTROL,
        disabled: isCore
      },
      {
        type: PolicyType.SAML_IDP,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
        disabled: !isCaptivePortalSsoSamlEnabled
      },
      {
        type: PolicyType.SNMP_AGENT,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.MONITORING_TROUBLESHOOTING
      },
      {
        type: PolicyType.SOFTGRE,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.NETWORK_SERVICES,
        disabled: !isSoftGreEnabled
      },
      {
        type: PolicyType.SYSLOG,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.MONITORING_TROUBLESHOOTING
      },
      {
        type: PolicyType.TUNNEL_PROFILE,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.EDGE],
        category: UnifiedServiceCategory.NETWORK_SERVICES,
        disabled: !isEdgeEnabled
      },
      {
        type: PolicyType.VLAN_POOL,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.NETWORK_SERVICES
      },
      {
        type: PolicyType.WIFI_OPERATOR,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.USER_EXPERIENCE_PORTALS,
        disabled: !supportHotspot20R1
      },
      {
        type: PolicyType.WORKFLOW,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.NETWORK_SERVICES,
        disabled: !isWorkflowFFEnabled || !isWorkflowTierEnabled
      },
      {
        type: ServiceType.DHCP,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.NETWORK_SERVICES
      },
      {
        type: ServiceType.DPSK,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY
      },
      {
        type: ServiceType.EDGE_DHCP,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.EDGE],
        category: UnifiedServiceCategory.NETWORK_SERVICES,
        disabled: !isEdgeHaReady || !isEdgeDhcpHaReady
      },
      {
        type: ServiceType.EDGE_FIREWALL,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.EDGE],
        category: UnifiedServiceCategory.SECURITY_ACCESS_CONTROL,
        disabled: !isEdgeHaReady || !isEdgeFirewallHaReady
      },
      {
        type: ServiceType.EDGE_MDNS_PROXY,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.EDGE],
        category: UnifiedServiceCategory.MONITORING_TROUBLESHOOTING,
        disabled: !isEdgeMdnsReady,
        isBetaFeature: isEdgeMdnsBetaEnabled
      },
      {
        type: ServiceType.EDGE_OLT,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.EDGE],
        category: UnifiedServiceCategory.NETWORK_SERVICES,
        disabled: !isEdgeOltEnabled,
        readonly: true
      },
      {
        type: ServiceType.EDGE_SD_LAN,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.EDGE],
        category: UnifiedServiceCategory.NETWORK_SERVICES,
        disabled: !(isEdgeSdLanReady || isEdgeSdLanHaReady)
      },
      {
        type: ServiceType.EDGE_TNM_SERVICE,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.EDGE],
        category: UnifiedServiceCategory.NETWORK_SERVICES,
        disabled: !isEdgeTnmServiceReady
      },
      {
        type: ServiceType.MDNS_PROXY,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.MONITORING_TROUBLESHOOTING
      },
      {
        type: ServiceType.PIN,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.EDGE],
        category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
        disabled: !isEdgePinReady
      },
      {
        type: ServiceType.PORTAL,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.USER_EXPERIENCE_PORTALS,
        disabled: isPortalProfileEnabled
      },
      {
        type: ServiceType.RESIDENT_PORTAL,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.USER_EXPERIENCE_PORTALS,
        disabled: !propertyManagementEnabled
      },
      {
        type: ServiceType.WEBAUTH_SWITCH,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.SWITCH],
        category: UnifiedServiceCategory.USER_EXPERIENCE_PORTALS,
        disabled: isPortalProfileEnabled || (!isEdgePinReady || !networkSegmentationSwitchEnabled)
      },
      {
        type: ServiceType.PORTAL_PROFILE,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH],
        category: UnifiedServiceCategory.USER_EXPERIENCE_PORTALS,
        disabled: !isPortalProfileEnabled
      },
      {
        type: ServiceType.WIFI_CALLING,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.NETWORK_SERVICES
      }
    ].filter(svc => isUnifiedServiceAvailable(svc))

    return baseUnifiedServiceList
  }, [])
}

export function useAvailableUnifiedServicesList (): Array<UnifiedService> {
  const baseUnifiedServiceList = useBaseAvailableUnifiedServicesList()

  return buildUnifiedServices(baseUnifiedServiceList)
    .sort((a, b) => a.label.localeCompare(b.label))
}
