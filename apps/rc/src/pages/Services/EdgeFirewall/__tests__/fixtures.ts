export const mockFirewall = {
  id: 'mock-id',//615bf69d-1661-4a14-9bc7-f7d7b7bc769c
  tenantId: 't-id',
  serviceName: 'test',
  tags: [],
  edgeIds: ['0000000002'],
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

export const mockEdgeList = {
  fields: [
    'name','deviceStatus','type','model','serialNumber','ip',
    'ports','venueName','venueId','tags'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      name: 'Smart Edge 1',
      deviceStatus: '1_07_Initializing',
      deviceStatusSeverity: '1_InSetupPhase',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000001',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      firmwareVersion: '1.1.1.1'
    },
    {
      name: 'Smart Edge 2',
      deviceStatus: '1_01_NeverContactedCloud',
      deviceStatusSeverity: '1_InSetupPhase',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000002',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      firmwareVersion: '1.1.1.1'
    },
    {
      name: 'Smart Edge 3',
      deviceStatus: '1_09_Offline',
      deviceStatusSeverity: '1_InSetupPhase_Offline',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000003',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      firmwareVersion: '1.1.1.1'
    },
    {
      name: 'Smart Edge 4',
      deviceStatus: '1_10_NeedsConfig',
      deviceStatusSeverity: '1_InSetupPhase',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000004',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      firmwareVersion: '1.1.1.1'
    },
    {
      name: 'Smart Edge 5',
      deviceStatus: '2_00_Operational',
      deviceStatusSeverity: '2_Operational',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000005',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      firmwareVersion: '1.1.1.1'
    }
  ]
}