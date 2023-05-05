import { IntlShape } from 'react-intl'

import { AccessAction, ACLDirection, AddressType, ProtocolType } from '../../models/EdgeFirewallEnum'

export const getACLDirectionString = ($t: IntlShape['$t'], type: ACLDirection) => {
  switch (type) {
    case ACLDirection.INBOUND:
      return $t({ defaultMessage: 'Inbound' })
    case ACLDirection.OUTBOUND:
      return $t({ defaultMessage: 'Outbound' })
    default:
      return ''
  }
}

export const getProtocolTypeString = ($t: IntlShape['$t'], type: ProtocolType) => {
  switch (type) {
    case ProtocolType.ANY:
      return $t({ defaultMessage: 'Any' })
    case ProtocolType.TCP:
      return $t({ defaultMessage: 'TCP' })
    case ProtocolType.UDP:
      return $t({ defaultMessage: 'UDP' })
    case ProtocolType.ICMP:
      return $t({ defaultMessage: 'ICMP' })
    case ProtocolType.IGMP:
      return $t({ defaultMessage: 'IGMP' })
    case ProtocolType.ESP:
      return $t({ defaultMessage: 'ESP' })
    case ProtocolType.AH:
      return $t({ defaultMessage: 'AH' })
    case ProtocolType.SCTP:
      return $t({ defaultMessage: 'SCTP' })
    case ProtocolType.CUSTOM:
      return $t({ defaultMessage: 'Custom' })
    default:
      return ''
  }
}

// inbound will not have "inspect"
export const getAccessActionString = ($t: IntlShape['$t'], type: AccessAction) => {
  switch (type) {
    case AccessAction.ALLOW:
      return $t({ defaultMessage: 'Allow' })
    case AccessAction.BLOCK:
      return $t({ defaultMessage: 'Block' })
    case AccessAction.INSPECT:
      return $t({ defaultMessage: 'Inspect' })
    default:
      return ''
  }
}

export const getAddressTypeString = ($t: IntlShape['$t'], type: AddressType) => {
  switch (type) {
    case AddressType.ANY_IP_ADDRESS:
      return $t({ defaultMessage: 'Any IP Address' })
    case AddressType.SUBNET_ADDRESS:
      return $t({ defaultMessage: 'Subnet Address' })
    case AddressType.IP_ADDRESS:
      return $t({ defaultMessage: 'IP Address' })
    default:
      return ''
  }
}