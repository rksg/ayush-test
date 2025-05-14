import { ClusterHaFallbackScheduleTypeEnum, ClusterHaLoadDistributionEnum, ClusterHighAvailabilityModeEnum, ClusterNodeStatusEnum, ClusterStatusEnum, EdgeIpModeEnum, EdgeLagLacpModeEnum, EdgeLagTimeoutEnum, EdgeLagTypeEnum, EdgePortTypeEnum, EdgeServiceTypeEnum, NodeClusterRoleEnum } from '../../../../models/EdgeEnum'
import { ClusterNetworkSettings }                                                                                                                                                                                                                                                            from '../../../../types/edge'

export const mockEdgeList = {
  fields: [
    'name','deviceStatus','type','model','serialNumber','ip',
    'ports','venueName','venueId','tags','clusterId'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      name: 'Smart Edge 1',
      deviceStatus: '2_00_Operational',
      type: 'Virtual',
      model: 'model 1',
      serialNumber: '0000000001',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      clusterId: 'cluster-1',
      firmwareVersion: '1.9.0.100'
    },
    {
      name: 'Smart Edge 2',
      deviceStatus: '2_00_Operational',
      type: 'Virtual',
      model: 'model 1',
      serialNumber: '0000000002',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      clusterId: 'cluster-2',
      firmwareVersion: '1.9.0.200'
    },
    {
      name: 'Smart Edge 3',
      deviceStatus: '2_00_Operational',
      type: 'Virtual',
      model: 'model 1',
      serialNumber: '0000000003',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      clusterId: 'cluster-3',
      firmwareVersion: '1.9.0.900'
    },
    {
      name: 'Smart Edge 4',
      deviceStatus: '2_00_Operational',
      type: 'Virtual',
      model: 'model 1',
      serialNumber: '0000000004',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      clusterId: 'cluster-4',
      firmwareVersion: '2.1.0.900'
    },
    {
      name: 'Smart Edge 5',
      deviceStatus: '1_01_NeverContactedCloud',
      type: 'Virtual',
      model: 'model 1',
      serialNumber: '0000000005',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      clusterId: 'cluster-5',
      firmwareVersion: '2.1.0.850'
    }
  ]
}

export const mockEdgeServiceList = {
  fields: null,
  totalCount: 5,
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
      serviceType: EdgeServiceTypeEnum.PIN,
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
    },
    {
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F5',
      serviceName: 'SDLAN-1',
      serviceId: 'sdlan-1',
      serviceType: EdgeServiceTypeEnum.SD_LAN,
      status: 'Up',
      currentVersion: '1.1.1',
      targetVersion: ''
    },
    {
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F5',
      serviceName: 'Mock mDNS',
      serviceId: 'edge-mdns-1',
      serviceType: EdgeServiceTypeEnum.MDNS_PROXY,
      status: 'Up',
      currentVersion: '1.1.1',
      targetVersion: ''
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
  tags: ['tag1', 'tag2'],
  clusterId: 'clusterId_1'
}

export const mockHaAaFeatureRequirement = {
  featureSets: [
    {
      featureName: 'HA-AA',
      requiredFw: '2.1.0.500'
    }
  ]
}

export const mockedVenueFirmwareList = [
  {
    id: 'mock_venue_1',
    name: 'Mock Venue 1',
    versions: [
      {
        name: '1.0.0.1709',
        id: '1.0.0.1709',
        category: 'RECOMMENDED'
      }
    ]
  },
  {
    id: 'mock_venue_2',
    name: 'Mock Venue 2',
    versions: [
      {
        name: '2.1.0.600',
        id: '2.1.0.600',
        category: 'RECOMMENDED'
      }
    ]
  },
  {
    id: 'mock_venue_3',
    name: 'Mock Venue 3',
    versions: [
      {
        name: '2.3.0.200',
        id: '2.3.0.200',
        category: 'RECOMMENDED'
      }
    ]
  }
]


export const mockEdgeDnsServersData = {
  primary: '1.1.1.1',
  secondary: '2.2.2.2'
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

export const mockEdgeClusterList = {
  fields: [
    'tenantId', 'clusterId', 'name', 'virtualIp', 'venueId', 'venueName',
    'clusterStatus', 'edgeList', 'activeAps', 'isHqosEnabled'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      tenantId: 'tenantId_1',
      clusterId: 'clusterId_1',
      name: 'Edge Cluster 1',
      virtualIp: '1.1.1.1,1.1.1.2',
      venueId: 'mock_venue_1',
      venueName: 'venue_1',
      clusterStatus: ClusterStatusEnum.CLUSTER_READY,
      highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE,
      hasCorePort: true,
      activeAps: 1000,
      isHqosEnabled: true,
      edgeList: [
        {
          name: 'Smart Edge 1',
          deviceStatus: '2_00_Operational',
          type: 'Virtual',
          model: 'model 1',
          serialNumber: 'serialNumber-1',
          ip: '0.0.0.0',
          ports: '3',
          venueName: 'Venue 1',
          venueId: 'mock_venue_1',
          tags: ['Tag1', 'Tag2'],
          clusterNodeStatus: ClusterNodeStatusEnum.CLUSTER_NODE_READY,
          haStatus: NodeClusterRoleEnum.CLUSTER_ROLE_ACTIVE,
          cpuCores: 2,
          cpuUsedPercentage: 25,
          memoryUsedKb: 4626208,
          memoryTotalKb: 7949424,
          firmwareVersion: '2.2.0.1015'
        },
        {
          name: 'Smart Edge 2',
          deviceStatus: '2_00_Operational',
          type: 'Virtual',
          model: 'model 2',
          serialNumber: 'serialNumber-2',
          ip: '0.0.0.0',
          ports: '3',
          venueName: 'Venue 1',
          venueId: 'mock_venue_1',
          tags: ['Tag1', 'Tag2'],
          clusterNodeStatus: ClusterNodeStatusEnum.CLUSTER_NODE_READY,
          haStatus: NodeClusterRoleEnum.CLUSTER_ROLE_ACTIVE,
          cpuCores: 2,
          cpuUsedPercentage: 25,
          memoryUsedKb: 4626208,
          memoryTotalKb: 7949420,
          firmwareVersion: '2.2.0.1015'
        }
      ]
    },
    {
      tenantId: 'tenantId_2',
      clusterId: 'clusterId_2',
      name: 'Edge Cluster 2',
      virtualIp: '1.1.1.1,1.1.1.2',
      venueId: '0000000002',
      venueName: 'venue_2',
      clusterStatus: 'test',
      highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY,
      hasCorePort: true,
      edgeList: [
        {
          name: 'Smart Edge 4',
          deviceStatus: '2_00_Operational',
          type: 'Virtual',
          model: 'model 1',
          serialNumber: 'serialNumber-4',
          ip: '0.0.0.0',
          ports: '80',
          venueName: 'Venue 1',
          venueId: 'mock_venue_1',
          tags: ['Tag1', 'Tag2'],
          clusterNodeStatus: ClusterNodeStatusEnum.CLUSTER_NODE_READY,
          haStatus: NodeClusterRoleEnum.CLUSTER_ROLE_ACTIVE,
          firmwareVersion: '2.2.0.1031'
        },
        {
          name: 'Smart Edge 5',
          deviceStatus: '2_00_Operational',
          type: 'Virtual',
          model: 'model 1',
          serialNumber: 'serialNumber-5',
          ip: '0.0.0.0',
          ports: '80',
          venueName: 'Venue 1',
          venueId: 'mock_venue_1',
          tags: ['Tag1', 'Tag2'],
          clusterNodeStatus: ClusterNodeStatusEnum.CLUSTER_NODE_READY,
          haStatus: NodeClusterRoleEnum.CLUSTER_ROLE_BACKUP,
          firmwareVersion: '2.2.0.1031'
        }
      ]
    },{
      tenantId: 'tenantId_3',
      clusterId: 'clusterId_3',
      name: 'Edge Cluster 3',
      virtualIp: '1.1.1.1,1.1.1.2',
      venueId: '0000000003',
      venueName: 'venue_3',
      clusterStatus: ClusterStatusEnum.CLUSTER_READY,
      edgeList: [
        {
          name: 'Smart Edge 4',
          deviceStatus: '1_01_NeverContactedCloud',
          type: 'Virtual',
          model: 'model 1',
          serialNumber: 'serialNumber-4',
          ip: '0.0.0.0',
          ports: '2',
          venueName: 'Venue 3',
          venueId: '0000000003',
          tags: ['Tag1', 'Tag2'],
          clusterNodeStatus: ClusterNodeStatusEnum.CLUSTER_NODE_READY,
          haStatus: NodeClusterRoleEnum.CLUSTER_ROLE_ACTIVE,
          firmwareVersion: '2.1.0.1031'
        }
      ]
    },{
      tenantId: 'tenantId_4',
      clusterId: 'clusterId_4',
      name: 'Edge Cluster 4',
      virtualIp: '1.1.1.1,1.1.1.2',
      venueId: '0000000004',
      venueName: 'venue_4',
      clusterStatus: ClusterStatusEnum.CLUSTER_IS_FORMING,
      edgeList: [
        {
          name: 'Smart Edge 6',
          deviceStatus: '2_00_Operational',
          type: 'Virtual',
          model: 'model 1',
          serialNumber: 'serialNumber-6',
          ip: '0.0.0.0',
          ports: '80',
          venueName: 'Venue 1',
          venueId: 'mock_venue_1',
          tags: ['Tag1', 'Tag2'],
          clusterNodeStatus: ClusterNodeStatusEnum.CLUSTER_NODE_GETTING_READY,
          haStatus: NodeClusterRoleEnum.CLUSTER_ROLE_ACTIVE
        },
        {
          name: 'Smart Edge 7',
          deviceStatus: '2_00_Operational',
          type: 'Virtual',
          model: 'model 1',
          serialNumber: 'serialNumber-7',
          ip: '0.0.0.0',
          ports: '80',
          venueName: 'Venue 1',
          venueId: 'mock_venue_1',
          tags: ['Tag1', 'Tag2'],
          clusterNodeStatus: ClusterNodeStatusEnum.CLUSTER_NODE_GETTING_READY,
          haStatus: NodeClusterRoleEnum.CLUSTER_ROLE_BACKUP
        }
      ]
    },{
      tenantId: 'tenantId_5',
      clusterId: 'clusterId_5',
      name: 'Edge Cluster 5',
      virtualIp: '1.1.1.1,1.1.1.2',
      venueId: '0000000005',
      venueName: 'venue_5',
      clusterStatus: ClusterStatusEnum.CLUSTER_UNHEALTHY,
      highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY,
      hasCorePort: true,
      edgeList: [
        {
          name: 'Smart Edge 8',
          deviceStatus: '2_00_Operational',
          type: 'Virtual',
          model: 'model 1',
          serialNumber: 'serialNumber-8',
          ip: '0.0.0.0',
          ports: '80',
          venueName: 'Venue 1',
          venueId: 'mock_venue_1',
          tags: ['Tag1', 'Tag2'],
          clusterNodeStatus: ClusterNodeStatusEnum.CLUSTER_NODE_UNHEALTHY,
          haStatus: NodeClusterRoleEnum.CLUSTER_ROLE_ACTIVE,
          firmwareVersion: '2.1.0.750'
        },
        {
          name: 'Smart Edge 9',
          deviceStatus: '2_00_Operational',
          type: 'Virtual',
          model: 'model 1',
          serialNumber: 'serialNumber-9',
          ip: '0.0.0.0',
          ports: '80',
          venueName: 'Venue 1',
          venueId: 'mock_venue_1',
          tags: ['Tag1', 'Tag2'],
          clusterNodeStatus: ClusterNodeStatusEnum.CLUSTER_NODE_UNHEALTHY,
          haStatus: NodeClusterRoleEnum.CLUSTER_ROLE_BACKUP,
          firmwareVersion: '2.1.0.750'
        }
      ]
    }
  ]
}

export const mockEdgeCluster = {
  id: 'clusterId_1',
  name: 'Edge Cluster 1',
  smartEdges: [
    {
      serialNumber: 'serialNumber-1',
      name: 'Smart Edge 1'
    },
    {
      serialNumber: 'serialNumber-2',
      name: 'Smart Edge 2'
    }
  ],
  virtualIpSettings: {
    virtualIps: [
      {
        virtualIp: '192.168.13.1',
        ports: [
          {
            serialNumber: 'serialNumber-1',
            portName: 'port2'
          },
          {
            serialNumber: 'serialNumber-2',
            portName: 'port2'
          }
        ],
        timeoutSeconds: 6
      },
      {
        virtualIp: '192.168.14.1',
        ports: [
          {
            serialNumber: 'serialNumber-1',
            portName: 'port3'
          },
          {
            serialNumber: 'serialNumber-2',
            portName: 'port3'
          }
        ],
        timeoutSeconds: 6
      }
    ]
  }
}

export const mockedHaNetworkSettings = {
  lagSettings: [{
    serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
    lags: [{
      id: 0,
      description: 'string',
      lagType: EdgeLagTypeEnum.LACP,
      lacpMode: EdgeLagLacpModeEnum.ACTIVE,
      lacpTimeout: EdgeLagTimeoutEnum.SHORT,
      lagMembers: [],
      portType: EdgePortTypeEnum.LAN,
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '',
      subnet: '',
      gateway: '',
      corePortEnabled: false,
      natEnabled: true,
      lagEnabled: true,
      natPools: []
    }]
  }, {
    serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
    lags: [{
      id: 1,
      description: 'string',
      lagType: EdgeLagTypeEnum.LACP,
      lacpMode: EdgeLagLacpModeEnum.ACTIVE,
      lacpTimeout: EdgeLagTimeoutEnum.SHORT,
      lagMembers: [],
      portType: EdgePortTypeEnum.LAN,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '1.10.10.1',
      subnet: '255.255.0.0',
      gateway: '127.1.1.0',
      corePortEnabled: false,
      natEnabled: false,
      lagEnabled: true,
      natPools: []
    }]
  }],
  portSettings: [{
    serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
    ports: [{
      id: 'port_id_0',
      name: '',
      mac: '00:0c:29:b6:ad:00',
      enabled: false,
      portType: EdgePortTypeEnum.WAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '1.1.1.1',
      subnet: '255.255.255.0',
      gateway: '1.1.1.1',
      corePortEnabled: false,
      interfaceName: 'port1',
      maxSpeedCapa: 0.0,
      natPools: []
    },
    {
      id: 'port_id_1',
      name: '',
      mac: '00:11:00:22:00:01',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '2.2.2.3',
      subnet: '255.255.255.0',
      gateway: '2.2.2.1',
      corePortEnabled: true,
      interfaceName: 'port2',
      maxSpeedCapa: 0.0,
      natPools: []
    }]
  }, {
    serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
    ports: [{
      id: 'port_id_0',
      name: '',
      mac: '00:0c:29:b6:ad:02',
      enabled: false,
      portType: EdgePortTypeEnum.WAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '',
      subnet: '',
      gateway: '',
      corePortEnabled: false,
      interfaceName: 'port1',
      natPools: []
    },
    {
      id: 'port_id_1',
      name: '',
      mac: '00:11:00:22:00:03',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '2.2.2.2',
      subnet: '255.255.255.0',
      gateway: '2.2.2.1',
      corePortEnabled: true,
      interfaceName: 'port2',
      natPools: []
    }]
  }],
  virtualIpSettings: [{
    virtualIp: '1.1.1.1',
    ports: [{
      serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
      portName: 'port2'
    }, {
      serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
      portName: 'port2'
    }],
    timeoutSeconds: 6
  }],
  highAvailabilitySettings: {
    fallbackSettings: {
      enable: true,
      schedule: {
        type: ClusterHaFallbackScheduleTypeEnum.DAILY,
        time: '00:00'
      }
    },
    loadDistribution: ClusterHaLoadDistributionEnum.AP_GROUP
  },
  subInterfaceSettings: [
    {
      serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
      ports: [
        {
          portId: 'port_id_0',
          interfaceName: 'port1',
          subInterfaces: [
            {
              id: '2deb8142-13fd-4658-a38c-a5be78aa894e',
              vlan: 123,
              portType: 'LAN',
              ipMode: 'STATIC',
              ip: '1.1.5.1',
              subnet: '255.255.255.0'
            }
          ]
        },
        {
          portId: 'port_id_1',
          interfaceName: 'port2',
          subInterfaces: []
        }
      ],
      lags: [
        {
          lagId: 0,
          subInterfaces: [
            {
              id: '392d0d59-566b-486e-ad55-fa9610b1a96b',
              vlan: 1,
              portType: 'LAN',
              ipMode: 'STATIC',
              ip: '1.1.3.1',
              subnet: '255.255.255.0'
            }
          ]
        }
      ]
    },
    {
      serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
      ports: [
        {
          portId: 'port_id_0',
          interfaceName: 'port1',
          subInterfaces: []
        },
        {
          portId: 'port_id_1',
          interfaceName: 'port2',
          subInterfaces: [
            {
              id: '2165e0d4-4aae-4d2d-8fc7-bcae11c7bacb',
              vlan: 1,
              portType: 'LAN',
              ipMode: 'STATIC',
              ip: '1.1.2.1',
              subnet: '255.255.255.0'
            }
          ]
        }
      ],
      lags: [
        {
          lagId: 1,
          subInterfaces: [
            {
              id: 'b4bca3e8-4f2a-463d-9b8f-0a4c3b21f5ec',
              vlan: 3,
              portType: 'LAN',
              ipMode: 'DHCP',
              ip: '',
              subnet: ''
            }
          ]
        }
      ]
    }
  ]
} as unknown as ClusterNetworkSettings