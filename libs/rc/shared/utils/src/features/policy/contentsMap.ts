import { MessageDescriptor, defineMessage } from 'react-intl'

import { PolicyType }   from '../../types'
import { OperatorType } from '../../types/policies/radiusAttributeGroup'

export const AttributeOperationLabelMapping: Record<OperatorType, MessageDescriptor> = {
  [OperatorType.ADD]: defineMessage({ defaultMessage: 'Add (Multiple)' }),
  [OperatorType.ADD_REPLACE]: defineMessage({ defaultMessage: 'Add or Replace (Single)' }),
  [OperatorType.DOES_NOT_EXIST]: defineMessage({ defaultMessage: 'Add if it Doesn\'t Exist' })
}

export const policyTypeLabelMapping: Record<PolicyType, MessageDescriptor> = {
  [PolicyType.AAA]: defineMessage({ defaultMessage: 'RADIUS Server' }),
  [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Access Control' }),
  [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: 'Client Isolation' }),
  [PolicyType.IDENTITY_PROVIDER]: defineMessage({ defaultMessage: 'Identity Provider' }),
  [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: 'Rogue AP Detection' }),
  [PolicyType.SYSLOG]: defineMessage({ defaultMessage: 'Syslog Server' }),
  [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: 'VLAN Pools' }),
  [PolicyType.MAC_REGISTRATION_LIST]: defineMessage({ defaultMessage: 'MAC Registration List' }),
  [PolicyType.LAYER_2_POLICY]: defineMessage({ defaultMessage: 'Layer 2 Policy' }),
  [PolicyType.LAYER_3_POLICY]: defineMessage({ defaultMessage: 'Layer 3 Policy' }),
  [PolicyType.APPLICATION_POLICY]: defineMessage({ defaultMessage: 'Application Policy' }),
  [PolicyType.DEVICE_POLICY]: defineMessage({ defaultMessage: 'Device Policy' }),
  [PolicyType.SNMP_AGENT]: defineMessage({ defaultMessage: 'SNMP Agent' }),
  [PolicyType.ADAPTIVE_POLICY]: defineMessage({ defaultMessage: 'Adaptive Policy' }),
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: defineMessage({ defaultMessage: 'Radius Attribute group' }),
  [PolicyType.ADAPTIVE_POLICY_SET]: defineMessage({ defaultMessage: 'Adaptive Policy Set(TBD)' }),
  [PolicyType.TUNNEL_PROFILE]: defineMessage({ defaultMessage: 'Tunnel Profile' }),
  [PolicyType.CONNECTION_METERING]: defineMessage({ defaultMessage: 'Data Usage Metering' })
}
