import { defineMessage, MessageDescriptor } from 'react-intl'

import { PolicyTechnology, PolicyType } from '@acx-ui/rc/utils'

export const policyTypeLabelMapping: Record<PolicyType, MessageDescriptor> = {
  [PolicyType.AAA]: defineMessage({ defaultMessage: 'AAA Server' }),
  [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Access Control' }),
  [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: 'Client Isolation' }),
  [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: 'Rogue AP Detection' }),
  [PolicyType.SYSLOG]: defineMessage({ defaultMessage: 'Syslog Server' }),
  [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: 'VLAN Pools' })
}
// export const policyTypeDescMapping: Record<PolicyType, MessageDescriptor> = {
//   [PolicyType.AAA]: defineMessage({ defaultMessage: '' }),
//   [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: '' }),
//   [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: '' }),
//   [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: '' }),
//   [PolicyType.SYSLOG]: defineMessage({ defaultMessage: '' }),
//   [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: '' })
// }
export const policyTechnologyLabelMapping: Record<PolicyTechnology, MessageDescriptor> = {
  [PolicyTechnology.WIFI]: defineMessage({ defaultMessage: 'Wi-Fi' }),
  [PolicyTechnology.SWITCH]: defineMessage({ defaultMessage: 'Switch' })
}
