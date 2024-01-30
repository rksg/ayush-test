import { EdgeServiceTypeEnum } from '../../../../models/EdgeEnum'

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

export const mockEdgeServiceList = {
  fields: null,
  totalCount: 4,
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
    },
    {
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F5',
      serviceName: 'SDLAN-1',
      serviceId: 'sdlan-1',
      serviceType: EdgeServiceTypeEnum.SD_LAN,
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
  tags: ['tag1', 'tag2']
}


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
    'clusterStatus', 'edgeList'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      tenantId: 'tenantId_1',
      clusterId: 'clusterId_1',
      name: 'Edge Cluster 1',
      virtualIp: '1.1.1.1,1.1.1.2',
      venueId: '0000000001',
      venueName: 'venue_1',
      clusterStatus: 'Nodes synced',
      edgeList: [
        {
          name: 'Smart Edge 1',
          deviceStatus: '2_00_Operational',
          type: 'type 1',
          model: 'model 1',
          serialNumber: 'serialNumber-1',
          ip: '0.0.0.0',
          ports: '80',
          venueName: 'Venue 1',
          venueId: '0000000001',
          tags: ['Tag1', 'Tag2']
        },
        {
          name: 'Smart Edge 2',
          deviceStatus: '2_00_Operational',
          type: 'type 1',
          model: 'model 1',
          serialNumber: 'serialNumber-2',
          ip: '0.0.0.0',
          ports: '80',
          venueName: 'Venue 1',
          venueId: '0000000002',
          tags: ['Tag1', 'Tag2']
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
      clusterStatus: '',
      edgeList: []
    },{
      tenantId: 'tenantId_3',
      clusterId: 'clusterId_3',
      name: 'Edge Cluster 3',
      virtualIp: '1.1.1.1,1.1.1.2',
      venueId: '0000000003',
      venueName: 'venue_3',
      clusterStatus: 'Single node',
      edgeList: [
        {
          name: 'Smart Edge 3',
          deviceStatus: '1_01_NeverContactedCloud',
          type: 'type 1',
          model: 'model 1',
          serialNumber: '0000000005',
          ip: '0.0.0.0',
          ports: '80',
          venueName: 'Venue 3',
          venueId: '0000000003',
          tags: ['Tag1', 'Tag2']
        }
      ]
    },{
      tenantId: 'tenantId_4',
      clusterId: 'clusterId_4',
      name: 'Edge Cluster 4',
      virtualIp: '1.1.1.1,1.1.1.2',
      venueId: '0000000004',
      venueName: 'venue_4',
      clusterStatus: '',
      edgeList: []
    },{
      tenantId: 'tenantId_5',
      clusterId: 'clusterId_5',
      name: 'Edge Cluster 5',
      virtualIp: '1.1.1.1,1.1.1.2',
      venueId: '0000000005',
      venueName: 'venue_5',
      clusterStatus: '',
      edgeList: []
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