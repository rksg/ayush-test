import _, { cloneDeep } from 'lodash'

import { EdgeIpModeEnum, EdgePortTypeEnum, EdgeWanLinkHealthStatusEnum, EdgeWanPortRoleStatusEnum } from '../../../../models/EdgeEnum'
import { EdgeMultiWanConfigStats, EdgeNodesPortsInfo, EdgePortInfo, EdgePortStatus }                from '../../../../types/edge'

import { mockEdgeClusterList } from './general'

export const mockEdgePortConfig = {
  ports: [
    {
      id: '6ab895d4-cb8a-4664-b3f9-c4d6e0c8b8c1',
      name: 'port0',
      mac: '00:0c:29:b6:ad:04',
      enabled: true,
      portType: EdgePortTypeEnum.WAN,
      natEnabled: false,
      natPools: [],
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '1.1.1.1',
      subnet: '255.255.255.0',
      gateway: '1.1.1.1',
      corePortEnabled: false,
      interfaceName: 'port1',
      maxSpeedCapa: 0
    },
    {
      id: '20b445af-7270-438d-88a3-a5a2219c377b',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      natPools: [],
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '2.2.2.2',
      subnet: '255.255.255.0',
      gateway: '',
      corePortEnabled: true,
      interfaceName: 'port2',
      maxSpeedCapa: 0
    },
    {
      id: 'cdecd42e-81e3-4d60-921c-6b05181a53ae',
      name: 'port1',
      mac: '00:0c:29:b6:ad:0e',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      natPools: [],
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '3.3.3.3',
      subnet: '255.255.255.0',
      gateway: '',
      corePortEnabled: false,
      interfaceName: 'port3',
      maxSpeedCapa: 0
    },
    {
      id: '6fcbcfc2-c207-4e45-b392-1f529cd1d6d4',
      name: 'tap0',
      mac: '02:fe:05:1f:95:85',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      natPools: [],
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '4.4.4.4',
      subnet: '255.255.255.0',
      gateway: '',
      corePortEnabled: false,
      interfaceName: 'port4',
      maxSpeedCapa: 0
    },
    {
      id: '081a71a7-aaad-4a13-967b-1c82166de11a',
      name: 'port2',
      mac: '00:0c:29:b6:ad:18',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: true,
      natPools: [],
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '5.5.5.5',
      subnet: '255.255.255.0',
      gateway: '',
      corePortEnabled: false,
      interfaceName: 'port5',
      maxSpeedCapa: 0
    }
  ]
}

export const mockPortInfo = mockEdgePortConfig.ports.map(p => ({
  serialNumber: 'serialNumber-1',
  portName: p.interfaceName,
  ip: `${p.ip}/24`,
  mac: p.mac,
  subnet: '',
  portType: p.portType,
  isCorePort: p.corePortEnabled,
  isLagMember: [''].indexOf(p.interfaceName) !== -1,
  portEnabled: p.enabled
}))

export const mockedPortsStatus = {} as EdgeNodesPortsInfo
mockEdgeClusterList.data[0].edgeList.forEach((item, idx) => {
  const portInfo = mockPortInfo.map(port => {
    const ipData = port.ip.split('/')[0].split('.')

    // ex: 1.1.1.(1+idx) => 1.1.1.10
    return {
      ...port,
      ip: `${[...ipData.slice(0, 3), ipData[3]+idx].join('.')}/24`
    }
  }) as EdgePortInfo[]

  mockedPortsStatus[item.serialNumber] = portInfo
})

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


// eslint-disable-next-line max-len
export const mockEdgePortConfigWithStatusIpWithoutCorePort = _.cloneDeep(mockEdgePortConfigWithStatusIp)
mockEdgePortConfigWithStatusIpWithoutCorePort.ports[1].corePortEnabled = false

export const mockEdgeOnlyLanPortConfig = _.cloneDeep(mockEdgePortConfigWithStatusIp)
mockEdgeOnlyLanPortConfig.ports.splice(0, 1)
mockEdgeOnlyLanPortConfig.ports[0].gateway = '2.2.2.2'

export const mockEdgeOnlyLanPortConfigWithoutCorePort = _.cloneDeep(mockEdgeOnlyLanPortConfig)
mockEdgeOnlyLanPortConfigWithoutCorePort.ports[0].corePortEnabled = false

export const mockEdgePortStatus = [
  {
    portId: mockEdgePortConfig.ports[0].id,
    ip: '10.206.78.152',
    portName: 'port1'
  },
  {
    portId: mockEdgePortConfig.ports[1].id,
    ip: '',
    portName: 'port2'
  },
  {
    portId: mockEdgePortConfig.ports[2].id,
    ip: '10.206.78.153',
    portName: 'port3'
  },
  {
    portId: mockEdgePortConfig.ports[3].id,
    ip: '10.206.78.154',
    portName: 'port4'
  },
  {
    portId: mockEdgePortConfig.ports[4].id,
    ip: '10.206.78.155',
    portName: 'port5'
  }
]

export const edgePortsSetting:EdgePortStatus[] = [{
  portId: '68a3028a-93ed-11ee-b9d1-0242ac120001',
  name: 'description1',
  status: 'Up',
  adminStatus: 'Enabled',
  type: EdgePortTypeEnum.WAN,
  mac: 'AA:BB:CC:DD:EE:FF',
  speedKbps: 12* Math.pow(12, 6),
  duplex: 'Full',
  ip: '1.1.1.1/24',
  ipMode: 'DHCP',
  sortIdx: 1,
  vlan: '',
  subnet: '',
  interfaceName: 'port1'
},
{
  portId: '68a3028a-93ed-11ee-b9d1-0242ac120002',
  name: 'description2',
  status: 'Down',
  adminStatus: 'Disabled',
  type: EdgePortTypeEnum.LAN,
  mac: 'AA:BB:CC:DD:EE:F1',
  speedKbps: 10* Math.pow(12, 6),
  duplex: 'Half',
  ip: '1.1.1.2',
  ipMode: 'Static',
  sortIdx: 2,
  vlan: '',
  subnet: '',
  interfaceName: 'port2'
}]

export const mockLanInterfaces = {
  [mockEdgeClusterList.data[0].edgeList[0].serialNumber]: [
    {
      id: 'se1-port3',
      mac: '00:00:00:00',
      ipMode: EdgeIpModeEnum.STATIC,
      serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
      portName: 'port3',
      ip: '192.168.14.135',
      subnet: '255.255.255.0',
      portType: EdgePortTypeEnum.LAN,
      isCorePort: false,
      isLagMember: false,
      portEnabled: true,
      isLag: false
    },
    {
      id: 'se1-port2',
      mac: '00:00:00:01',
      ipMode: EdgeIpModeEnum.STATIC,
      serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
      portName: 'port2',
      ip: '192.168.13.136',
      subnet: '255.255.255.0',
      portType: EdgePortTypeEnum.LAN,
      isCorePort: false,
      isLagMember: false,
      portEnabled: true,
      isLag: false
    },
    {
      id: 'se1-lag0',
      mac: '00:00:00:04',
      ipMode: EdgeIpModeEnum.DHCP,
      serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
      portName: 'lag0',
      ip: '',
      subnet: '',
      portType: EdgePortTypeEnum.LAN,
      isCorePort: true,
      isLagMember: false,
      portEnabled: true,
      isLag: true
    }
  ],
  [mockEdgeClusterList.data[0].edgeList[1].serialNumber]: [
    {
      id: 'se2-port3',
      mac: '00:00:00:02',
      ipMode: EdgeIpModeEnum.STATIC,
      serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
      portName: 'port3',
      ip: '192.168.14.135',
      subnet: '255.255.255.0',
      portType: EdgePortTypeEnum.LAN,
      isCorePort: false,
      isLagMember: false,
      portEnabled: true,
      isLag: false
    },
    {
      id: 'se2-port2',
      mac: '00:00:00:03',
      ipMode: EdgeIpModeEnum.STATIC,
      serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
      portName: 'port2',
      ip: '192.168.13.134',
      subnet: '255.255.255.0',
      portType: EdgePortTypeEnum.LAN,
      isCorePort: false,
      isLagMember: false,
      portEnabled: true,
      isLag: false
    },
    {
      id: 'se2-lag0',
      mac: '00:00:00:05',
      ipMode: EdgeIpModeEnum.DHCP,
      serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
      portName: 'lag0',
      ip: '',
      subnet: '',
      portType: EdgePortTypeEnum.LAN,
      isCorePort: true,
      isLagMember: false,
      portEnabled: true,
      isLag: true
    }
  ]
}

export const mockedLagStatus = {} as EdgeNodesPortsInfo
mockEdgeClusterList.data[0].edgeList.forEach((item) => {
  const lagInfo = mockLanInterfaces[item.serialNumber]
    .filter(port => {
      return port.portName.startsWith('lag')
    })
    .map((lag, idx) => {
      lag.id = idx + ''
      return lag
    }) as EdgePortInfo[]

  mockedLagStatus[item.serialNumber] = lagInfo
})

export const mockClusterInterfaceOptionData = {
  [mockEdgeClusterList.data[0].edgeList[0].serialNumber]: [
    {
      serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
      portName: 'port3',
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '192.168.14.135/24',
      subnet: '255.255.255.0',
      portType: EdgePortTypeEnum.LAN,
      isCorePort: false,
      isLagMember: false,
      portEnabled: true,
      mac: 'F6:C9:AE:00:DD:B5'
    },
    {
      serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
      portName: 'port2',
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '',
      subnet: '',
      portType: EdgePortTypeEnum.UNCONFIGURED,
      isCorePort: false,
      isLagMember: true,
      portEnabled: true,
      mac: 'BE:B9:DD:95:1B:DF'
    },
    {
      serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
      portName: 'lag0',
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '192.168.11.136/24',
      subnet: '255.255.255.0',
      portType: EdgePortTypeEnum.CLUSTER,
      isCorePort: false,
      isLagMember: false,
      portEnabled: true,
      mac: 'C1:8E:2D:38:E1:3E'
    }
  ],
  [mockEdgeClusterList.data[0].edgeList[1].serialNumber]: [
    {
      serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
      portName: 'port3',
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '192.168.9.135/24',
      subnet: '255.255.255.0',
      portType: EdgePortTypeEnum.LAN,
      isCorePort: false,
      isLagMember: false,
      portEnabled: true,
      mac: '0E:4E:BF:EF:DF:0E'
    },
    {
      serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
      portName: 'port2',
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '',
      subnet: '',
      portType: EdgePortTypeEnum.UNCONFIGURED,
      isCorePort: false,
      isLagMember: true,
      portEnabled: true,
      mac: '63:0C:EE:F6:EB:10'
    },
    {
      serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
      portName: 'lag0',
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '192.168.12.136/24',
      subnet: '255.255.255.0',
      portType: EdgePortTypeEnum.CLUSTER,
      isCorePort: false,
      isLagMember: false,
      portEnabled: true,
      mac: 'EB:BC:53:A1:12:CD'
    }
  ]
}

export const mockedDualWanLinkHealthConfigStatus = {
  tenantId: '0a38bee60d11436fa86e89bec56d31fd',
  serialNumber: '9681F063FD151C11F0A524000C29B087E4',
  edgeClusterId: 'bce32f26-9807-4888-bfd1-13a56d857a3c',
  multiWanPolicyId: '0472cb3e-fddd-4b87-bf63-b5879cbb82ca',
  portName: 'port1',
  priority: 2,
  linkHealthMonitorEnabled: true,
  monitorProtocol: 'PING',
  monitorTargets: [
    '8.8.8.8',
    '7.7.8.8'
  ],
  monitorLinkDownCriteria: 'ALL_TARGETS_DOWN',
  monitorIntervalSec: 8,
  monitorMaxCountToDown: 8,
  monitorMaxCountToUp: 8,

  wanLinkStatus: EdgeWanLinkHealthStatusEnum.UP,
  wanLinkTargets: [{ ip: '8.8.8.8', status: EdgeWanLinkHealthStatusEnum.UP }],
  wanPortStatus: EdgeWanPortRoleStatusEnum.ACTIVE
} as EdgeMultiWanConfigStats

export const mockedEdgePortWithDualWan = cloneDeep(edgePortsSetting)
mockedEdgePortWithDualWan[0].multiWan = mockedDualWanLinkHealthConfigStatus