import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  ApplicationAclType,
  ApplicationRuleType,
  Layer3ProtocolType,
  PolicyTechnology,
  PolicyType
} from '@acx-ui/rc/utils'

export const policyTypeLabelMapping: Record<PolicyType, MessageDescriptor> = {
  [PolicyType.AAA]: defineMessage({ defaultMessage: 'AAA Server' }),
  [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Access Control' }),
  [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: 'Client Isolation' }),
  [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: 'Rogue AP Detection' }),
  [PolicyType.SYSLOG]: defineMessage({ defaultMessage: 'Syslog Server' }),
  [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: 'VLAN Pools' }),
  [PolicyType.MAC_REGISTRATION_LIST]: defineMessage({ defaultMessage: 'MAC Registration' })
}
export const policyTypeDescMapping: Record<PolicyType, MessageDescriptor> = {
  [PolicyType.AAA]: defineMessage({ defaultMessage: 'AAA description (TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Access Control description (TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: 'Client Isolation description (TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: 'Rogue AP Detection description (TBD)' }),
  [PolicyType.SYSLOG]: defineMessage({ defaultMessage: 'Syslog description (TBD)' }),
  [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: 'VLAN Pool description (TBD)' }),
  [PolicyType.MAC_REGISTRATION_LIST]: defineMessage({ defaultMessage: 'MAC Registration (TBD)' })
}
export const policyTechnologyLabelMapping: Record<PolicyTechnology, MessageDescriptor> = {
  [PolicyTechnology.WIFI]: defineMessage({ defaultMessage: 'Wi-Fi' }),
  [PolicyTechnology.SWITCH]: defineMessage({ defaultMessage: 'Switch' })
}

export const layer3ProtocolLabelMapping: Record<Layer3ProtocolType, MessageDescriptor> = {
  [Layer3ProtocolType.ANYPROTOCOL]: defineMessage({ defaultMessage: 'Any Protocol' }),
  [Layer3ProtocolType.TCP]: defineMessage({ defaultMessage: 'TCP' }),
  [Layer3ProtocolType.UDP]: defineMessage({ defaultMessage: 'UDP' }),
  [Layer3ProtocolType.UDPLITE]: defineMessage({ defaultMessage: 'UDPLITE' }),
  [Layer3ProtocolType.ICMP]: defineMessage({ defaultMessage: 'ICMP(ICMPV4)' }),
  [Layer3ProtocolType.IGMP]: defineMessage({ defaultMessage: 'IGMP' }),
  [Layer3ProtocolType.ESP]: defineMessage({ defaultMessage: 'ESP' }),
  [Layer3ProtocolType.AH]: defineMessage({ defaultMessage: 'AH' }),
  [Layer3ProtocolType.SCTP]: defineMessage({ defaultMessage: 'SCTP' })
}

export const AppAclLabelMapping: Record<ApplicationAclType, MessageDescriptor> = {
  [ApplicationAclType.DENY]: defineMessage({ defaultMessage: 'Block Applications' }),
  [ApplicationAclType.RATE_LIMIT]: defineMessage({ defaultMessage: 'Rate Limit' }),
  [ApplicationAclType.QOS]: defineMessage({ defaultMessage: 'QoS' })
}

export const AppRuleLabelMapping: Record<ApplicationRuleType, MessageDescriptor> = {
  [ApplicationRuleType.SIGNATURE]: defineMessage({ defaultMessage: 'System defined' }),
  [ApplicationRuleType.USER_DEFINED]: defineMessage({ defaultMessage: 'User defined' })
}




