export const mockedFWService = {
  id: 'firewallServiceId1',
  serviceName: 'testingEdgeFirewall',
  tags: ['tag1', 'tag2'],
  edgeIds: [
    'EDGE55000033'
  ],
  ddosRateLimitingEnabled: true,
  ddosRateLimitingRules: [
    {
      ddosAttackType: 'ICMP',
      rateLimiting: 200
    }
  ],
  statefulAclEnabled: true,
  statefulAcls: [
    {
      name: 'ACL_Outbound_Ruls',
      description: 'acl rules for outbound',
      direction: 'OUTBOUND',
      rules: [
        {
          priority: 1,
          description: 'Default ACL rule',
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
          description: 'Default ACL rule',
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
          description: 'User outbound rule for inspecting from Edge to cloud',
          accessAction: 'INSPECT',
          protocolType: 'ANY',
          protocolValue: 11,
          sourceAddressType: 'IP_ADDRESS',
          sourceAddress: '',
          sourceAddressMask: '',
          sourcePort: '',
          destinationAddressType: 'IP_ADDRESS',
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
    },
    {
      name: 'ACL_Inbound_Ruls',
      description: 'acl rules for inbound',
      direction: 'INBOUND',
      rules: [
        {
          priority: 1,
          description: 'User inbound rule for inspecting from Edge to cloud',
          accessAction: 'INSPECT',
          protocolType: 'ANY',
          protocolValue: 11,
          sourceAddressType: 'IP_ADDRESS',
          sourceAddress: '',
          sourceAddressMask: '',
          sourcePort: '',
          destinationAddressType: 'IP_ADDRESS',
          destinationAddress: '',
          destinationAddressMask: '',
          destinationPort: ''
        },
        {
          priority: 2,
          description: 'Default ACL rule',
          accessAction: 'BLOCK',
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
  ] // end of statefulAcls
}

export const mockedDefaultValue = [
  {
    name: 'Inbound ACL',
    direction: 'INBOUND',
    rules: [
      {
        priority: 1,
        description: 'Default rule',
        accessAction: 'BLOCK',
        protocolType: 'ANY',
        protocolValue: 0,
        sourceAddressType: 'ANY_IP_ADDRESS',
        destinationAddressType: 'ANY_IP_ADDRESS'
      }
    ]
  }, {
    name: 'Outbound ACL',
    direction: 'OUTBOUND',
    rules: [
      {
        priority: 1,
        description: 'Cloud mgmt. (Default)',
        accessAction: 'INSPECT',
        protocolType: 'ANY',
        sourceAddressType: 'ANY_IP_ADDRESS',
        destinationAddressType: 'IP_ADDRESS',
        destinationAddress: 'RuckusOne IP'
      },
      {
        priority: 2,
        description: 'Cloud mgmt.(https) (Default)',
        accessAction: 'INSPECT',
        protocolType: 'TCP',
        sourceAddressType: 'ANY_IP_ADDRESS',
        destinationAddressType: 'ANY_IP_ADDRESS',
        destinationPort: 443
      },
      {
        priority: 3,
        description: 'Cloud mgmt.(ntp) (Default)',
        accessAction: 'INSPECT',
        protocolType: 'UDP',
        sourceAddressType: 'ANY_IP_ADDRESS',
        destinationAddressType: 'ANY_IP_ADDRESS',
        destinationPort: 123
      },
      {
        priority: 4,
        description: 'Default rule',
        accessAction: 'INSPECT',
        protocolType: 'ANY',
        sourceAddressType: 'ANY_IP_ADDRESS',
        destinationAddressType: 'ANY_IP_ADDRESS'
      }
    ]
  }
]