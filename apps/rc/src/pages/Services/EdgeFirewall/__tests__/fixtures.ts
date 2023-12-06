import {
  ACLDirection,
  DdosAttackType
} from '@acx-ui/rc/utils'

export const mockFirewall = {
  id: 'mock-id',
  serviceName: 'test',
  tags: [],
  edgeIds: [],
  ddosRateLimitingEnabled: false,
  ddosRateLimitingRules: null,
  statefulAclEnabled: true,
  statefulAcls: [
    {
      name: 'Outbound ACL',
      description: '',
      direction: 'OUTBOUND',
      rules: [
        {
          priority: 1,
          description: 'Cloud mgmt. (Default)',
          accessAction: 'INSPECT',
          protocolType: 'ANY',
          protocolValue: null,
          sourceAddressType: 'ANY_IP_ADDRESS',
          sourceAddress: null,
          sourceAddressMask: null,
          sourcePort: '',
          destinationAddressType: 'ANY_IP_ADDRESS',
          destinationAddress: 'ACX-IP',
          destinationAddressMask: null,
          destinationPort: ''
        },
        {
          priority: 2,
          description: 'Cloud mgmt.(https) (Default)',
          accessAction: 'INSPECT',
          protocolType: 'TCP',
          protocolValue: null,
          sourceAddressType: 'ANY_IP_ADDRESS',
          sourceAddress: null,
          sourceAddressMask: null,
          sourcePort: '',
          destinationAddressType: 'ANY_IP_ADDRESS',
          destinationAddress: null,
          destinationAddressMask: null,
          destinationPort: '443'
        },
        {
          priority: 3,
          description: 'Cloud mgmt.(ntp) (Default)',
          accessAction: 'INSPECT',
          protocolType: 'UDP',
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
          description: 'Default rule',
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

export const mockedFirewallDataList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '1',
      firewallName: 'TestFirewall1',
      ddosEnabled: true,
      ddosRateLimitingRules: {
        [DdosAttackType.ALL]: 220,
        [DdosAttackType.ICMP]: 200
      },
      statefulAclEnabled: true,
      statefulAcls: [
        {
          aclName: 'ACL1',
          aclDirection: ACLDirection.INBOUND,
          aclRuleNum: 2
        },
        {
          aclName: 'ACL2',
          aclDirection: ACLDirection.OUTBOUND,
          aclRuleNum: 2
        }
      ],
      edgeIds: ['0000000001', '0000000002', '0000000003'],
      serviceVersions: {
        '0000000001': '1.0.0.100',
        '0000000002': '1.0.0.100',
        '0000000003': '1.0.0.210'
      },
      edgeAlarmSummary: [
        {
          edgeId: '0000000003',
          severitySummary: {
            critical: 1
          },
          totalCount: 1
        }
      ]
    },
    {
      id: '2',
      firewallName: 'TestFirewall2',
      ddosEnabled: false,
      ddosRateLimitingRules: {
        [DdosAttackType.ALL]: 220,
        [DdosAttackType.ICMP]: 200
      },
      statefulAclEnabled: false,
      statefulAcls: [
        {
          aclName: 'ACL1',
          aclDirection: ACLDirection.INBOUND,
          aclRuleNum: 2
        },
        {
          aclName: 'ACL2',
          aclDirection: ACLDirection.OUTBOUND,
          aclRuleNum: 2
        }
      ],
      edgeIds: [],
      serviceVersions: {}
    },
    {
      id: '3',
      firewallName: 'TestFirewall3',
      ddosEnabled: false,
      ddosRateLimitingRules: {
        [DdosAttackType.ALL]: 220,
        [DdosAttackType.ICMP]: 200
      },
      statefulAclEnabled: false,
      statefulAcls: [
        {
          aclName: 'ACL1',
          aclDirection: ACLDirection.INBOUND,
          aclRuleNum: 2
        },
        {
          aclName: 'ACL2',
          aclDirection: ACLDirection.OUTBOUND,
          aclRuleNum: 2
        }
      ],
      edgeIds: [],
      serviceVersions: {}
    }
  ]
}
