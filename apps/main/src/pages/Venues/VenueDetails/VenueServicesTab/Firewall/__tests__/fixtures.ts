import { ACLDirection, AccessAction, ProtocolType, AddressType, DdosAttackType } from '@acx-ui/rc/utils'

export const mockEdgeList = {
  fields: [
    'name','serialNumber', 'firewallId'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      name: 'Smart Edge 1',
      serialNumber: '0000000001',
      firewallId: 'mockedFirewallId'
    }
  ]
}

export const mockFirewall = {
  id: 'mock-id',
  tenantId: 't-id',
  serviceName: 'mocked-firewall',
  tags: [],
  edgeIds: [],
  ddosRateLimitingEnabled: false,
  ddosRateLimitingRules: null,
  statefulAclEnabled: true,
  statefulAcls: [
    {
      name: 'Inbound ACL',
      description: '',
      direction: ACLDirection.INBOUND,
      rules: [
        {
          priority: 1,
          accessAction: AccessAction.BLOCK,
          protocolType: ProtocolType.ANY,
          protocolValue: 0,
          sourceAddressType: AddressType.ANY_IP_ADDRESS,
          destinationAddressType: AddressType.ANY_IP_ADDRESS
        }
      ]
    },
    {
      name: 'Outbound ACL',
      description: '',
      direction: ACLDirection.OUTBOUND,
      rules: [
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
          description: '',
          accessAction: 'BLOCK',
          protocolType: 'ICMP',
          protocolValue: null,
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
      ]
    }
  ]
}

export const mockFirewall2 = {
  id: 'mock-id',
  tenantId: 't-id',
  serviceName: 'mocked-firewall-ddos',
  tags: null,
  edgeIds: [],
  ddosRateLimitingEnabled: true,
  ddosRateLimitingRules: [
    {
      ddosAttackType: DdosAttackType.ICMP,
      rateLimiting: 200
    },
    {
      ddosAttackType: DdosAttackType.NTP_REFLECTION,
      rateLimiting: 120
    }
  ],
  statefulAclEnabled: false,
  statefulAcls: [
    {
      name: 'Inbound ACL',
      description: '',
      direction: ACLDirection.INBOUND,
      rules: [
        {
          priority: 1,
          accessAction: AccessAction.BLOCK,
          protocolType: ProtocolType.ANY,
          protocolValue: 0,
          sourceAddressType: AddressType.ANY_IP_ADDRESS,
          destinationAddressType: AddressType.ANY_IP_ADDRESS
        }
      ]
    },
    {
      name: 'Outbound ACL',
      description: '',
      direction: ACLDirection.OUTBOUND,
      rules: [
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
          description: '',
          accessAction: 'BLOCK',
          protocolType: 'ICMP',
          protocolValue: null,
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
      ]
    }
  ]
}