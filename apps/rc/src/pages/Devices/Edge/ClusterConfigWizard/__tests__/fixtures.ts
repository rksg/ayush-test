import _ from 'lodash'

import {
  ClusterNetworkSettings,
  ClusterSubInterfaceSettings,
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

import { InterfaceSettingsFormType }    from '../InterfaceSettings/types'
import { SubInterfaceSettingsFormType } from '../SubInterfaceSettings/types'

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
  vipConfig: mockedHaNetworkSettings.virtualIpSettings?.map(item => {
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

export const mockClusterSubInterfaceSettings = {
  nodes: [
    {
      serialNumber: '96000076DCCAA42E87785B549A64997E72',
      ports: [
        {
          portId: '29445906-158a-4535-8e1e-5d4852d064c6',
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
          portId: '4f40f9cd-54fe-49bc-aade-bbc25ee2b6a7',
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
      serialNumber: '96000036D1099D0C32121B82EB7786AC26',
      ports: [
        {
          portId: 'c10a7aa2-766c-4e29-a193-bb8f0fe9b02d',
          subInterfaces: []
        },
        {
          portId: '85dd1fee-4e1f-42ba-a939-988e263612d3',
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
          lagId: 3,
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
} as ClusterSubInterfaceSettings

export const mockSubInterfaceSettingsFormType = {
  portSubInterfaces: {
    '96000076DCCAA42E87785B549A64997E72': {
      '29445906-158a-4535-8e1e-5d4852d064c6': [
        {
          id: '2deb8142-13fd-4658-a38c-a5be78aa894e',
          vlan: 123,
          portType: 'LAN',
          ipMode: 'STATIC',
          ip: '1.1.5.1',
          subnet: '255.255.255.0'
        }
      ],
      '4f40f9cd-54fe-49bc-aade-bbc25ee2b6a7': []
    },
    '96000036D1099D0C32121B82EB7786AC26': {
      'c10a7aa2-766c-4e29-a193-bb8f0fe9b02d': [],
      '85dd1fee-4e1f-42ba-a939-988e263612d3': [
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
  },
  lagSubInterfaces: {
    '96000076DCCAA42E87785B549A64997E72': {
      0: [
        {
          id: '392d0d59-566b-486e-ad55-fa9610b1a96b',
          vlan: 1,
          portType: 'LAN',
          ipMode: 'STATIC',
          ip: '1.1.3.1',
          subnet: '255.255.255.0'
        }
      ]
    },
    '96000036D1099D0C32121B82EB7786AC26': {
      3: [
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
  }
} as SubInterfaceSettingsFormType
