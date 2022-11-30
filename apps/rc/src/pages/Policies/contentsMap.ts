import { defineMessage, MessageDescriptor } from 'react-intl'

import { PolicyTechnology, PolicyType } from '@acx-ui/rc/utils'

export const policyTypeLabelMapping: Record<PolicyType, MessageDescriptor> = {
  [PolicyType.AAA]: defineMessage({ defaultMessage: 'AAA Server' }),
  [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Access Control' }),
  [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: 'Client Isolation' }),
  [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: 'Rogue AP Detection' }),
  [PolicyType.SYSLOG]: defineMessage({ defaultMessage: 'Syslog Server' }),
  [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: 'VLAN Pools' }),
  [PolicyType.MAC_REGISTRATION_LIST]: defineMessage({ defaultMessage: 'MAC Registration' }),
  [PolicyType.ADAPTIVE_POLICY]: defineMessage({ defaultMessage: 'Adaptive Policy (TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: defineMessage({ defaultMessage: 'Radius Attribute group (TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.ADAPTIVE_POLICY_SET]: defineMessage({ defaultMessage: 'Radius Attribute group (TBD)' })
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
  [PolicyType.MAC_REGISTRATION_LIST]: defineMessage({ defaultMessage: 'MAC Registration (TBD)' }),
  [PolicyType.ADAPTIVE_POLICY]: defineMessage({ defaultMessage: 'Adaptive Policy (TBD)' }),
  [PolicyType.ADAPTIVE_POLICY_SET]: defineMessage({ defaultMessage: 'Adaptive Policy Set(TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: defineMessage({ defaultMessage: 'Radius Attribute group (TBD)' })
}
export const policyTechnologyLabelMapping: Record<PolicyTechnology, MessageDescriptor> = {
  [PolicyTechnology.WIFI]: defineMessage({ defaultMessage: 'Wi-Fi' }),
  [PolicyTechnology.SWITCH]: defineMessage({ defaultMessage: 'Switch' })
}
