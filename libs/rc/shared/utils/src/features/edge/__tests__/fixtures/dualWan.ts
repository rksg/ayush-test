import { cloneDeep } from 'lodash'

import { EdgeIpModeEnum, EdgeLagLacpModeEnum, EdgeLagTimeoutEnum, EdgeLagTypeEnum, EdgePortTypeEnum } from '../../../../models'

import { mockEdgeClusterList } from './general'
import { mockEdgePortConfig }  from './portsConfig'

export const mockDualWanData = {
  mode: 'ACTIVE_BACKUP',
  wanMembers: [
    {
      serialNumber: 'edgeId-1',
      portName: 'port1',
      priority: 1,
      healthCheckEnabled: true,
      linkHealthCheckPolicy: {
        protocol: 'PING',
        targetIpAddresses: [
          '8.8.8.8',
          '10.10.10.10'
        ],
        linkDownCriteria: 'ANY_TARGET_DOWN',
        intervalSeconds: 2,
        maxCountToDown: 7,
        maxCountToUp: 9
      }
    },
    {
      serialNumber: 'edgeId-1',
      portName: 'port2',
      priority: 2,
      healthCheckEnabled: false,
      linkHealthCheckPolicy: {
        protocol: 'PING',
        targetIpAddresses: [
          '2.2.2.2',
          '12.12.12.12'
        ],
        linkDownCriteria: 'ANY_TARGET_DOWN',
        intervalSeconds: 3,
        maxCountToDown: 5,
        maxCountToUp: 6
      }
    }
  ]
}


export const mockMultiWanPortConfigs = cloneDeep(mockEdgePortConfig)
mockMultiWanPortConfigs.ports[2].portType = EdgePortTypeEnum.WAN

export const mockedDualWanNetworkSettings = {
  lagSettings: [{
    serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
    lags: [{
      id: 0,
      description: 'string',
      lagType: EdgeLagTypeEnum.LACP,
      lacpMode: EdgeLagLacpModeEnum.ACTIVE,
      lacpTimeout: EdgeLagTimeoutEnum.SHORT,
      lagMembers: [{
        portId: 'port_id_1',
        portEnabled: true
      }],
      portType: EdgePortTypeEnum.WAN,
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '',
      subnet: '',
      gateway: '',
      corePortEnabled: false,
      accessPortEnabled: false,
      natEnabled: true,
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
      enabled: true,
      portType: EdgePortTypeEnum.WAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '1.1.1.1',
      subnet: '255.255.255.0',
      gateway: '1.1.1.1',
      corePortEnabled: false,
      accessPortEnabled: false,
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
      accessPortEnabled: true,
      interfaceName: 'port2',
      maxSpeedCapa: 0.0,
      natPools: []
    }]
  }],
  virtualIpSettings: [],
  multiWanSettings: {
    mode: 'ACTIVE_BACKUP',
    wanMembers: [
      {
        serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
        portName: 'lag0',
        priority: 1,
        healthCheckEnabled: true,
        linkHealthCheckPolicy: {
          protocol: 'PING',
          targetIpAddresses: [
            '8.8.8.8',
            '10.206.7.76'
          ],
          linkDownCriteria: 'ALL_TARGETS_DOWN',
          intervalSeconds: 3,
          maxCountToDown: 3,
          maxCountToUp: 3
        }
      },
      {
        serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
        portName: 'port1',
        priority: 2,
        healthCheckEnabled: true,
        linkHealthCheckPolicy: {
          protocol: 'PING',
          targetIpAddresses: [
            '8.8.8.8',
            '10.206.7.76'
          ],
          linkDownCriteria: 'ALL_TARGETS_DOWN',
          intervalSeconds: 3,
          maxCountToDown: 3,
          maxCountToUp: 3
        }
      }
    ]
  }
}