import { EdgeIpModeEnum, EdgePortTypeEnum } from '@acx-ui/rc/utils'

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
  serialNumber: '000000000000',
  venueId: '66e6694ca3334997998c42def9326797',
  edgeGroupId: '',
  description: 'This is description rr',
  edgeName: 'edgeName',
  tags: ['tag1', 'tag2']
}

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
      portType: EdgePortTypeEnum.UNCONFIGURED,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '',
      subnet: '',
      gateway: ''
    },
    {
      id: '20b445af-7270-438d-88a3-a5a2219c377b',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: EdgePortTypeEnum.UNCONFIGURED,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '',
      subnet: '',
      gateway: ''
    },
    {
      id: 'cdecd42e-81e3-4d60-921c-6b05181a53ae',
      name: 'port1',
      mac: '00:0c:29:b6:ad:0e',
      enabled: true,
      portType: EdgePortTypeEnum.UNCONFIGURED,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '',
      subnet: '',
      gateway: ''
    },
    {
      id: '6fcbcfc2-c207-4e45-b392-1f529cd1d6d4',
      name: 'tap0',
      mac: '02:fe:05:1f:95:85',
      enabled: true,
      portType: EdgePortTypeEnum.UNCONFIGURED,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '',
      subnet: '',
      gateway: ''
    },
    {
      id: '081a71a7-aaad-4a13-967b-1c82166de11a',
      name: 'port2',
      mac: '00:0c:29:b6:ad:18',
      enabled: true,
      portType: EdgePortTypeEnum.WAN,
      natEnabled: true,
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '',
      subnet: '',
      gateway: ''
    }
  ]
}