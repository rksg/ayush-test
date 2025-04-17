/* eslint-disable max-len */
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { RadioCardCategory }      from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { ServiceType }                       from '../../constants'
import { PolicyType, policyTypeDescMapping } from '../../types'
import { policyTypeLabelMapping }            from '../policy'

import { UnifiedServiceCategory, UnifiedServicesMetaDataType, UnifiedServiceStatus } from './constants'


export const unifiedServiceCategoryLabel: Record<UnifiedServiceCategory, MessageDescriptor> = {
  [UnifiedServiceCategory.AUTHENTICATION_IDENTITY]: defineMessage({ defaultMessage: 'Authentication & Identity Management' }),
  [UnifiedServiceCategory.SECURITY_ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Security & Access Control' }),
  [UnifiedServiceCategory.NETWORK_SERVICES]: defineMessage({ defaultMessage: 'Network Configuration & Services' }),
  [UnifiedServiceCategory.MONITORING_TROUBLESHOOTING]: defineMessage({ defaultMessage: 'Monitoring & Troubleshooting' }),
  [UnifiedServiceCategory.USER_EXPERIENCE_PORTALS]: defineMessage({ defaultMessage: 'User Experience & Portals' })
}

export function useUnifiedServicesList (): Array<UnifiedServicesMetaDataType> {
  const { $t } = useIntl()
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

  const unifiedServicesList: Array<UnifiedServicesMetaDataType> = [
    {
      type: PolicyType.AAA,
      label: $t(policyTypeLabelMapping[PolicyType.AAA]),
      description: $t(policyTypeDescMapping[PolicyType.AAA]),
      products: [RadioCardCategory.WIFI],
      category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.ACCESS_CONTROL,
      label: $t(policyTypeLabelMapping[PolicyType.ACCESS_CONTROL]),
      description: $t(policyTypeDescMapping[PolicyType.ACCESS_CONTROL]),
      products: [RadioCardCategory.WIFI],
      category: UnifiedServiceCategory.SECURITY_ACCESS_CONTROL,
      status: isSwitchMacAclEnabled ? UnifiedServiceStatus.DISABLED : UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.ACCESS_CONTROL,
      label: $t(policyTypeLabelMapping[PolicyType.ACCESS_CONTROL]),
      description: $t(policyTypeDescMapping[PolicyType.ACCESS_CONTROL]),
      products: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH],
      category: UnifiedServiceCategory.SECURITY_ACCESS_CONTROL,
      status: isSwitchMacAclEnabled ? UnifiedServiceStatus.ENABLED : UnifiedServiceStatus.DISABLED
    },
    {
      type: PolicyType.ADAPTIVE_POLICY,
      label: ,
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.ADAPTIVE_POLICY_SET,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.APPLICATION_POLICY,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.CERTIFICATE,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.CERTIFICATE_AUTHORITY,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.CERTIFICATE_TEMPLATE,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.CLIENT_ISOLATION,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.CONNECTION_METERING,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.DEVICE_POLICY,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.DIRECTORY_SERVER,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.ETHERNET_PORT_PROFILE,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.FLEX_AUTH,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.HQOS_BANDWIDTH,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.IDENTITY_PROVIDER,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.IPSEC,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.LAYER_2_POLICY,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.LAYER_3_POLICY,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.LBS_SERVER_PROFILE,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.MAC_REGISTRATION_LIST,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.PORT_PROFILE,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.ROGUE_AP_DETECTION,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.SAML_IDP,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.SERVER_CERTIFICATES,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.SNMP_AGENT,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.SOFTGRE,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.SWITCH_ACCESS_CONTROL,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.SWITCH_PORT_PROFILE,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.SYSLOG,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.TUNNEL_PROFILE,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.VLAN_POOL,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.WIFI_OPERATOR,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: PolicyType.WORKFLOW,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.DHCP,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.DPSK,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.EDGE_DHCP,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.EDGE_FIREWALL,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.EDGE_MDNS_PROXY,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.EDGE_OLT,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.EDGE_SD_LAN,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.EDGE_SD_LAN_P2,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.EDGE_TNM_SERVICE,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.MDNS_PROXY,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.PIN,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.PORTAL,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.RESIDENT_PORTAL,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.WEBAUTH_SWITCH,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    },
    {
      type: ServiceType.WIFI_CALLING,
      label: '',
      description: '',
      products: [],
      status: UnifiedServiceStatus.ENABLED
    }
  ]

  return unifiedServicesList
}
