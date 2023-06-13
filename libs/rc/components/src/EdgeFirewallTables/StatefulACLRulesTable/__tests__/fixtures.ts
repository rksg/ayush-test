import { AccessAction, AddressType, ProtocolType, StatefulAclRule } from '@acx-ui/rc/utils'

export const mockACLInboundRules = [
  {
    priority: 1,
    accessAction: AccessAction.BLOCK,
    protocolType: ProtocolType.ANY,
    protocolValue: 0,
    sourceAddressType: AddressType.ANY_IP_ADDRESS,
    destinationAddressType: AddressType.ANY_IP_ADDRESS
  }
]

export const mockACLOutboundRules = [
  {
    priority: 1,
    description: 'Default ACL rule',
    accessAction: AccessAction.INSPECT,
    protocolType: ProtocolType.ANY,
    sourceAddressType: AddressType.ANY_IP_ADDRESS,
    sourcePort: '',
    destinationAddressType: AddressType.ANY_IP_ADDRESS,
    destinationAddress: 'ACX-IP',
    destinationPort: ''
  },
  {
    priority: 2,
    description: 'Default ACL rule',
    accessAction: AccessAction.INSPECT,
    protocolType: ProtocolType.TCP,
    sourceAddressType: AddressType.ANY_IP_ADDRESS,
    sourcePort: '',
    destinationAddressType: AddressType.ANY_IP_ADDRESS,
    destinationPort: '443'
  },
  {
    priority: 3,
    description: 'Default ACL rule',
    accessAction: 'INSPECT',
    protocolType: 'ANY',
    protocolValue: null,
    sourceAddressType: 'ANY_IP_ADDRESS',
    sourceAddress: null,
    sourceAddressMask: null,
    sourcePort: '',
    destinationAddressType: 'ANY_IP_ADDRESS',
    destinationAddress: null,
    destinationAddressMask: null,
    destinationPort: '123'
  },
  {
    priority: 4,
    description: 'custom protocol value',
    accessAction: 'BLOCK',
    protocolType: 'CUSTOM',
    protocolValue: 213,
    sourceAddressType: 'ANY_IP_ADDRESS',
    sourceAddress: '',
    sourceAddressMask: '',
    sourcePort: '',
    destinationAddressType: 'ANY_IP_ADDRESS',
    destinationAddress: '',
    destinationAddressMask: '',
    destinationPort: ''
  },
  {
    priority: 5,
    description: 'custom rule',
    accessAction: AccessAction.ALLOW,
    protocolType: ProtocolType.SCTP,
    protocolValue: null,
    sourceAddressType: AddressType.IP_ADDRESS,
    sourceAddress: '192.168.10.11',
    sourceAddressMask: '',
    sourcePort: '',
    destinationAddressType: AddressType.IP_ADDRESS,
    destinationAddress: '192.168.2.3',
    destinationAddressMask: '',
    destinationPort: ''
  },
  {
    priority: 6,
    description: 'Default ACL rule',
    accessAction: 'INSPECT',
    protocolType: 'ANY',
    protocolValue: null,
    sourceAddressType: 'ANY_IP_ADDRESS',
    sourceAddress: null,
    sourceAddressMask: null,
    sourcePort: '',
    destinationAddressType: 'ANY_IP_ADDRESS',
    destinationAddress: null,
    destinationAddressMask: null,
    destinationPort: ''
  }
] as StatefulAclRule[]

export const mockACLInboundRulesWithStatistic = [
  {
    priority: 1,
    accessAction: AccessAction.BLOCK,
    protocolType: ProtocolType.ANY,
    protocolValue: 0,
    sourceAddressType: AddressType.ANY_IP_ADDRESS,
    destinationAddressType: AddressType.ANY_IP_ADDRESS,
    packets: 19,
    bytes: 300 * 1024
  }
]
