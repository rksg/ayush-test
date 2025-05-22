import _ from 'lodash'

import { EdgeIpModeEnum, EdgeLagLacpModeEnum, EdgeLagTimeoutEnum, EdgeLagTypeEnum, EdgePortTypeEnum } from '../../../../models/EdgeEnum'

export const mockedEdgeLagList = {
  content: [
    {
      id: 1,
      description: 'string',
      lagType: EdgeLagTypeEnum.LACP,
      lacpMode: EdgeLagLacpModeEnum.ACTIVE,
      lacpTimeout: EdgeLagTimeoutEnum.SHORT,
      lagMembers: [
        {
          portId: '00:0c:29:b6:ad:04',
          portEnabled: true
        },
        {
          portId: '00:00:00:00:00:00',
          portEnabled: true
        }
      ],
      portType: EdgePortTypeEnum.WAN,
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '',
      subnet: '',
      gateway: '',
      corePortEnabled: false,
      natEnabled: true,
      lagEnabled: true,
      natPools: []
    },
    {
      id: 2,
      description: 'string',
      lagType: EdgeLagTypeEnum.LACP,
      lacpMode: EdgeLagLacpModeEnum.ACTIVE,
      lacpTimeout: EdgeLagTimeoutEnum.SHORT,
      lagMembers: [],
      portType: EdgePortTypeEnum.LAN,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '1.1.1.1',
      subnet: '255.255.255.0',
      gateway: '1.0.0.0',
      corePortEnabled: false,
      natEnabled: true,
      lagEnabled: true,
      natPools: []
    }
  ],
  paging: {
    page: 1,
    pageSize: 10,
    totalCount: 2
  }
}

export const mockedEdgeLagListCorePortEnabled = _.cloneDeep(mockedEdgeLagList)
mockedEdgeLagListCorePortEnabled.content[0].portType = EdgePortTypeEnum.LAN
mockedEdgeLagListCorePortEnabled.content[0].corePortEnabled = true
mockedEdgeLagListCorePortEnabled.content[0].natEnabled = false

export const mockEdgeLagStatusList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      tenantId: 'test-tenant-id-1',
      serialNumber: 'edge-serial-number-1',
      lagId: 1,
      name: 'LAG 1',
      description: '',
      lagType: EdgeLagTypeEnum.LACP,
      lacpTimeout: EdgeLagTimeoutEnum.SHORT,
      status: 'Up',
      adminStatus: 'Enabled',
      lagMembers: [
        {
          portId: '774d0d62-265a-421a-9a85-cdcfbefeb065',
          name: 'Port 1',
          state: 'Up',
          systemId: '00:aa:bb:cc:dd:ee',
          key: '100',
          lacpTimeout: EdgeLagTimeoutEnum.SHORT,
          peerSystemId: '00:aa:bb:cc:dd:aa',
          peerKey: '200',
          rxCount: 10,
          txCount: 10
        },
        {
          portId: 'c2037758-f234-4477-b9dd-913f974f6516',
          name: 'Port 2',
          state: 'Up',
          systemId: '00:aa:bb:cc:11:22',
          key: '100',
          lacpTimeout: EdgeLagTimeoutEnum.SHORT,
          peerSystemId: '00:aa:bb:cc:33:44',
          peerKey: '200',
          rxCount: 10,
          txCount: 10
        }
      ],
      portType: EdgePortTypeEnum.WAN,
      vlan: '1',
      mac: 'AA:BB:CC:DD:EE:FF',
      ipMode: EdgeIpModeEnum.DHCP,
      isCorePort: 'true'
    },
    {
      tenantId: 'test-tenant-id-2',
      serialNumber: 'edge-serial-number-2',
      lagId: 2,
      name: 'LAG 2',
      description: '',
      lagType: EdgeLagTypeEnum.LACP,
      lacpTimeout: EdgeLagTimeoutEnum.SHORT,
      status: 'Down',
      adminStatus: 'Enabled',
      lagMembers: [],
      portType: EdgePortTypeEnum.LAN,
      vlan: '2',
      mac: 'A1:BB:2D:DD:EE:FF',
      ip: '123.1.2.1',
      subnet: '255.255.255.0',
      ipMode: EdgeIpModeEnum.STATIC,
      isCorePort: 'true'
    }
  ]
}

export const mockedEdgeLagListWithClusterType = {
  content: [
    {
      id: 0,
      description: 'string',
      lagType: 'LACP',
      lacpMode: 'ACTIVE',
      lacpTimeout: 'SHORT',
      lagMembers: [
        {
          portId: '00:0c:29:b6:ad:04',
          portEnabled: true
        },
        {
          portId: '00:00:00:00:00:00',
          portEnabled: true
        }
      ],
      portType: 'CLUSTER',
      ipMode: 'STATIC',
      ip: '1.1.1.1',
      subnet: '255.255.255.0',
      gateway: '',
      corePortEnabled: true,
      natEnabled: true,
      lagEnabled: true
    },
    {
      id: 1,
      description: 'string',
      lagType: 'LACP',
      lacpMode: 'ACTIVE',
      lacpTimeout: 'SHORT',
      lagMembers: [],
      portType: 'LAN',
      ipMode: 'STATIC',
      ip: '1.1.1.1',
      subnet: '255.255.255.0',
      gateway: '1.0.0.0',
      corePortEnabled: false,
      natEnabled: true,
      lagEnabled: true
    }
  ],
  paging: {
    page: 1,
    pageSize: 10,
    totalCount: 2
  }
}
