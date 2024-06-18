import _ from 'lodash'

import {
  ClusterNetworkSettings,
  EdgeClusterStatus,
  EdgeGeneralFixtures,
  EdgeIpModeEnum,
  EdgeLagLacpModeEnum,
  EdgeLagTimeoutEnum,
  EdgeLagTypeEnum,
  EdgePortConfigFixtures,
  EdgePortTypeEnum,
  EdgeSdLanFixtures,
  EdgeSdLanViewDataP2
} from '@acx-ui/rc/utils'

import { InterfaceSettingsFormType } from '../InterfaceSettings/types'

const { mockedHaNetworkSettings, mockEdgeClusterList } = EdgeGeneralFixtures
const { mockedPortsStatus } = EdgePortConfigFixtures
const { mockedSdLanServiceP2Dmz } = EdgeSdLanFixtures

export const mockClusterConfigWizardData = {
  portSettings: _.reduce(mockedHaNetworkSettings.portSettings,
    (result, port) => {
      result[port.serialNumber] = _.groupBy(port.ports, 'interfaceName')
      return result
    }, {} as InterfaceSettingsFormType['portSettings']),
  lagSettings: mockedHaNetworkSettings.lagSettings,
  vipConfig: mockedHaNetworkSettings.virtualIpSettings.map(item => {
    return {
      interfaces: item.ports,
      vip: item.virtualIp
    }
  }),
  timeout: 3
}

export const defaultCxtData = {
  clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
  portsStatus: mockedPortsStatus,
  edgeSdLanData: mockedSdLanServiceP2Dmz as EdgeSdLanViewDataP2,
  isLoading: false,
  isFetching: false
}

export const getTargetInterfaceFromInterfaceSettingsFormData = (
  serialNumber: string, portName: string,
  lagSettings: InterfaceSettingsFormType['lagSettings'],
  portSettings: InterfaceSettingsFormType['portSettings']
) => {
  if(portName.startsWith('l')) {
    return lagSettings.find(item => item.serialNumber === serialNumber)
      ?.lags.find(item => item.id.toString() === portName.charAt(3))
  } else {
    return portSettings[serialNumber]?.[portName]?.[0]
  }
}

export const mockFailedNetworkConfig = {
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
      corePortEnabled: true,
      natEnabled: true,
      lagEnabled: true
    }]
  }, {
    serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
    lags: [{
      id: 1,
      description: 'string',
      lagType: EdgeLagTypeEnum.LACP,
      lacpMode: EdgeLagLacpModeEnum.ACTIVE,
      lacpTimeout: EdgeLagTimeoutEnum.SHORT,
      lagMembers: [{
        portId: 'port_id_0',
        portEnabled: true
      }],
      portType: EdgePortTypeEnum.LAN,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '1.10.10.1',
      subnet: '255.255.0.0',
      gateway: '127.1.1.0',
      corePortEnabled: true,
      natEnabled: false,
      lagEnabled: true
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
      interfaceName: 'port1'
    },
    {
      id: 'port_id_1',
      name: '',
      mac: '00:11:00:22:00:01',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '2.2.2.2',
      subnet: '255.255.255.0',
      gateway: '',
      corePortEnabled: false,
      interfaceName: 'port2'
    }]
  }, {
    serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
    ports: [{
      id: 'port_id_0',
      name: '',
      mac: '00:0c:29:b6:ad:02',
      enabled: true,
      portType: EdgePortTypeEnum.UNCONFIGURED,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '',
      subnet: '',
      gateway: '',
      corePortEnabled: false,
      interfaceName: 'port1'
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
      gateway: '',
      corePortEnabled: false,
      interfaceName: 'port2'
    }]
  }],
  virtualIpSettings: [{
    virtualIp: '1.1.1.1',
    ports: [{
      serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
      portName: 'port2'
    }, {
      serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
      portName: 'lag0'
    }],
    timeoutSeconds: 6
  }]
} as ClusterNetworkSettings