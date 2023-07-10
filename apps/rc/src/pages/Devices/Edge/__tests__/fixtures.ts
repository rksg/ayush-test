import { EdgeIpModeEnum, EdgePortTypeEnum, EdgePortStatus, EdgeServiceTypeEnum, ACLDirection, AccessAction, ProtocolType, AddressType } from '@acx-ui/rc/utils'

export const mockVenueData = {
  fields: ['name', 'id'],
  totalCount: 3,
  page: 1,
  data: [
    { id: 'mock_venue_1', name: 'Mock Venue 1' },
    { id: 'mock_venue_2', name: 'Mock Venue 2' },
    { id: 'mock_venue_3', name: 'Mock Venue 3' }
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
      deviceStatus: '2_00_Operational',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000001',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2']
    },
    {
      name: 'Smart Edge 2',
      deviceStatus: '2_00_Operational',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000002',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2']
    },
    {
      name: 'Smart Edge 3',
      deviceStatus: '2_00_Operational',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000003',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2']
    },
    {
      name: 'Smart Edge 4',
      deviceStatus: '2_00_Operational',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000004',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2']
    },
    {
      name: 'Smart Edge 5',
      deviceStatus: '1_01_NeverContactedCloud',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000005',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2']
    }
  ]
}

export const mockEdgeData = {
  serialNumber: '96123456789',
  venueId: '66e6694ca3334997998c42def9326797',
  edgeGroupId: '',
  description: 'This is description rr',
  edgeName: 'edgeName',
  name: 'edgeName',
  tags: ['tag1', 'tag2']
}

export const edgePortsSetting:EdgePortStatus[] = [{
  portId: '1',
  name: 'Port 1',
  status: 'Up',
  adminStatus: 'Enabled',
  type: EdgePortTypeEnum.WAN,
  mac: 'AA:BB:CC:DD:EE:FF',
  speedKbps: 12* Math.pow(12, 6),
  duplex: 'Full',
  ip: '1.1.1.1',
  sortIdx: 1,
  vlan: '',
  subnet: ''
},
{
  portId: '2',
  name: 'Port 2',
  status: 'Down',
  adminStatus: 'Disabled',
  type: EdgePortTypeEnum.LAN,
  mac: 'AA:BB:CC:DD:EE:F1',
  speedKbps: 10* Math.pow(12, 6),
  duplex: 'Half',
  ip: '1.1.1.2',
  sortIdx: 2,
  vlan: '',
  subnet: ''
}]

export const mockEdgeDnsServersData = {
  primary: '1.1.1.1',
  secondary: '2.2.2.2'
}

export const mockEdgePortConfig = {
  ports: [
    {
      id: '6ab895d4-cb8a-4664-b3f9-c4d6e0c8b8c1',
      name: 'port0',
      mac: '00:0c:29:b6:ad:04',
      enabled: true,
      portType: EdgePortTypeEnum.WAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '1.1.1.1',
      subnet: '255.255.255.0',
      gateway: '1.1.1.1'
    },
    {
      id: '20b445af-7270-438d-88a3-a5a2219c377b',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '2.2.2.2',
      subnet: '255.255.255.0',
      gateway: '2.2.2.2'
    },
    {
      id: 'cdecd42e-81e3-4d60-921c-6b05181a53ae',
      name: 'port1',
      mac: '00:0c:29:b6:ad:0e',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '3.3.3.3',
      subnet: '255.255.255.0',
      gateway: '3.3.3.3'
    },
    {
      id: '6fcbcfc2-c207-4e45-b392-1f529cd1d6d4',
      name: 'tap0',
      mac: '02:fe:05:1f:95:85',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '4.4.4.4',
      subnet: '255.255.255.0',
      gateway: '4.4.4.4'
    },
    {
      id: '081a71a7-aaad-4a13-967b-1c82166de11a',
      name: 'port2',
      mac: '00:0c:29:b6:ad:18',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: true,
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '5.5.5.5',
      subnet: '255.255.255.0',
      gateway: '5.5.5.5'
    }
  ]
}

export const mockEdgePortStatus = [
  {
    portId: mockEdgePortConfig.ports[0].id,
    ip: '10.206.78.152'
  },
  {
    portId: mockEdgePortConfig.ports[1].id,
    ip: '10.206.78.153'
  }
]

export const mockEdgePortConfigWithStatusIp = {
  ports: [
    {
      ...mockEdgePortConfig.ports[0],
      statusIp: '10.206.78.152'
    },
    {
      ...mockEdgePortConfig.ports[1],
      statusIp: '10.206.78.153'
    },
    {
      ...mockEdgePortConfig.ports[2],
      statusIp: '10.206.78.154'
    },
    {
      ...mockEdgePortConfig.ports[3],
      statusIp: '10.206.78.155'
    },
    {
      ...mockEdgePortConfig.ports[4],
      statusIp: '10.206.78.156'
    }
  ]
}

export const mockEdgeSubInterfaces = {
  page: 1,
  pageSize: 10,
  totalCount: 10,
  content: [
    {
      id: 'fa663fd2-3057-44d9-ba25-9b45c93069cd',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: 'LAN',
      natEnabled: false,
      ipMode: 'DHCP',
      ip: '',
      subnet: '',
      gateway: '',
      vlan: 2
    },
    {
      id: 'fe04bc40-e1bb-4dd4-af9a-a218576f1f63',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: 'LAN',
      natEnabled: false,
      ipMode: 'DHCP',
      ip: '',
      subnet: '',
      gateway: '',
      vlan: 4
    },
    {
      id: 'e0edab51-0be9-46eb-aa0f-63600cd3396c',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: 'LAN',
      natEnabled: false,
      ipMode: 'DHCP',
      ip: '',
      subnet: '',
      gateway: '',
      vlan: 6
    },
    {
      id: '62e2aa44-a5c9-41f1-b90b-ffdcb314cdca',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: 'LAN',
      natEnabled: false,
      ipMode: 'DHCP',
      ip: '',
      subnet: '',
      gateway: '',
      vlan: 5
    },
    {
      id: 'dde3f2d0-ac27-4e1d-9789-25b3a401b2d9',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: 'LAN',
      natEnabled: false,
      ipMode: 'STATIC',
      ip: '4.4.4.4',
      subnet: '255.255.255.0',
      gateway: '',
      vlan: 88
    },
    {
      id: 'd654a5c8-974e-4467-8e49-82c945d56395',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: 'LAN',
      natEnabled: false,
      ipMode: 'DHCP',
      ip: '',
      subnet: '',
      gateway: '',
      vlan: 7
    },
    {
      id: '28375703-a754-45c2-ba02-1293f67b7b8e',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: 'LAN',
      natEnabled: false,
      ipMode: 'DHCP',
      ip: '',
      subnet: '',
      gateway: '',
      vlan: 8
    },
    {
      id: '935b9839-147d-44a0-9439-5357ea561487',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: 'LAN',
      natEnabled: false,
      ipMode: 'DHCP',
      ip: '',
      subnet: '',
      gateway: '',
      vlan: 9
    },
    {
      id: '4c184ef5-df78-4dac-9831-a50838585d98',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: 'LAN',
      natEnabled: false,
      ipMode: 'DHCP',
      ip: '',
      subnet: '',
      gateway: '',
      vlan: 10
    },
    {
      id: '2aca0be0-a547-4744-8535-bcf138a021a5',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: 'LAN',
      natEnabled: false,
      ipMode: 'DHCP',
      ip: '',
      subnet: '',
      gateway: '',
      vlan: 11
    }
  ]
}

export const mockStaticRoutes = {
  routes: [
    {
      id: 'row1',
      destIp: '10.100.120.0',
      destSubnet: '255.255.255.0',
      nextHop: '10.100.2.1'
    },
    {
      id: 'row2',
      destIp: '10.100.2.0',
      destSubnet: '255.255.255.0',
      nextHop: '10.100.1.1'
    }
  ]
}

export const mockValidationFailedDataWithDefinedCode = {
  errors: [{
    code: 'EDGE-10104',
    message: 'Insufficient licenses for tenant {0} to add new edge'
  }],
  requestId: 'test'
}

export const mockValidationFailedDataWithUndefinedCode = {
  errors: [{
    code: 'test123',
    message: 'Undefined message'
  }],
  requestId: 'test'
}

export const mockEdgeDhcpHostStats = {
  fields: null,
  totalCount: 2,
  page: 1,
  data: [
    {
      hostName: 'TestHost1',
      dhcpPoolName: 'pool1',
      hostIpAddr: '22.22.22.3',
      hostMac: '00:0c:29:26:dd:24',
      hostStatus: 'ONLINE',
      hostExpireDate: '2023-04-07 10:39:36',
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F2'
    },
    {
      hostName: 'TestHost2',
      dhcpPoolName: 'pool2',
      hostIpAddr: '22.22.22.1',
      hostMac: '00:0c:29:26:dd:20',
      hostStatus: 'OFFLINE',
      hostExpireDate: '2023-04-07 10:39:36',
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F2'
    }
  ]
}

export const mockedEdgeServiceList = {
  fields: null,
  totalCount: 3,
  page: 1,
  data: [
    {
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F2',
      serviceName: 'DHCP-1',
      serviceId: 'dhcp-1',
      serviceType: EdgeServiceTypeEnum.DHCP,
      status: 'Up',
      currentVersion: '',
      targetVersion: ''
    },
    {
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F3',
      serviceName: 'NSG-1',
      serviceId: 'nsg-1',
      serviceType: EdgeServiceTypeEnum.NETWORK_SEGMENTATION,
      status: 'Up',
      currentVersion: '1.1.1',
      targetVersion: ''
    },
    {
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F4',
      serviceName: 'FIREWALL-1',
      serviceId: 'firewall-1',
      serviceType: EdgeServiceTypeEnum.FIREWALL,
      status: 'Up',
      currentVersion: '1.1.1',
      targetVersion: '2.2.1'
    }
  ]
}

export const mockDhcpStatsData = {
  fields: [
    'tenantId','id','serviceName','serviceType','dhcpRelay','dhcpPoolNum',
    'edgeNum','venueNum','leaseTime', 'updateAvailable', 'serviceVersion',
    'tags'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '1',
      serviceName: 'TestDHCP-1',
      serviceType: 'DHCP',
      dhcpRelay: 'true',
      dhcpPoolNum: 3,
      edgeNum: 3,
      venueNum: 3,
      leaseTime: '24 hours',
      health: 'Good',
      updateAvailable: 'NO',
      serviceVersion: '0.0.1',
      tags: ['Tag1']
    },
    {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '2',
      serviceName: 'TestDHCP-2',
      serviceType: 'DHCP',
      dhcpRelay: 'false',
      dhcpPoolNum: 3,
      edgeNum: 3,
      venueNum: 3,
      leaseTime: '24 hours',
      health: 'Good',
      updateAvailable: 'NO',
      serviceVersion: '0.0.1',
      tags: ['Tag1']
    },{
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '3',
      serviceName: 'TestDHCP-3',
      serviceType: 'DHCP',
      dhcpRelay: 'false',
      dhcpPoolNum: 3,
      edgeNum: 3,
      venueNum: 3,
      leaseTime: '24 hours',
      health: 'Good',
      updateAvailable: 'NO',
      serviceVersion: '0.0.1',
      tags: ['Tag1']
    }
  ]
}

export const mockFirewallData = {
  id: 'firewall-1',
  tenantId: 't-id',
  serviceName: 'FIREWALL-1',
  tags: [],
  edgeIds: ['96B341ADD6C16C11ED8B8B000C296600F4'],
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

export const mockEdgeSubInterfacesStatus = {
  fields: ['subnet','vlan','ip','name','serial_number','type','sort_idx','mac','status'],
  totalCount: 2,
  page: 1,
  data: [
    {
      serialNumber: 'edge-serialnum',
      sortIdx: 0,
      name: '',
      status: 'Up',
      type: 'LAN',
      mac: 'AA:BB:CC:DD:EE:FF',
      ip: '192.168.5.3/25',
      subnet: '255.255.255.128',
      vlan: '4'
    },{
      serialNumber: 'edge-serialnum',
      sortIdx: 0,
      name: '',
      status: 'Up',
      type: 'LAN',
      mac: 'AA:BB:CC:DD:EE:FF',
      ip: '',
      subnet: '',
      vlan: '3'
    }]
}