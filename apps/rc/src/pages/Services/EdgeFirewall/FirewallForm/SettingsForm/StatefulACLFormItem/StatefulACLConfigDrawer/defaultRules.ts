import { AccessAction, AddressType, ProtocolType } from '@acx-ui/rc/utils'

export const InboundDefaultRules = [{
  priority: 1,
  description: 'Default rule',
  accessAction: AccessAction.BLOCK,
  protocolType: ProtocolType.ANY,
  protocolValue: 0,
  sourceAddressType: AddressType.ANY_IP_ADDRESS,
  destinationAddressType: AddressType.ANY_IP_ADDRESS
}]

export const OutboundDefaultRules = [{
  priority: 1,
  description: 'Cloud mgmt.',
  accessAction: AccessAction.INSPECT,
  protocolType: ProtocolType.ANY,
  sourceAddressType: AddressType.IP_ADDRESS,
  sourceAddress: 'SmartEdge IP',
  destinationAddressType: AddressType.IP_ADDRESS,
  destinationAddress: 'RuckusOne IP'
},{
  priority: 2,
  description: 'Cloud mgmt.(https)',
  accessAction: AccessAction.INSPECT,
  protocolType: ProtocolType.TCP,
  sourceAddressType: AddressType.IP_ADDRESS,
  sourceAddress: 'SmartEdge IP',
  destinationAddressType: AddressType.ANY_IP_ADDRESS,
  destinationPort: 443
},{
  priority: 3,
  description: 'Cloud mgmt.(ntp)',
  accessAction: AccessAction.INSPECT,
  protocolType: ProtocolType.ANY,
  sourceAddressType: AddressType.IP_ADDRESS,
  sourceAddress: 'SmartEdge IP',
  destinationAddressType: AddressType.ANY_IP_ADDRESS,
  destinationPort: 123
},{
  priority: 4,
  description: 'Default rule',
  accessAction: AccessAction.INSPECT,
  protocolType: ProtocolType.ANY,
  sourceAddressType: AddressType.ANY_IP_ADDRESS,
  destinationAddressType: AddressType.ANY_IP_ADDRESS
}]