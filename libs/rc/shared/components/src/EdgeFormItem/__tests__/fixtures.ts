import _ from 'lodash'

import { EdgeSdLanViewData, EdgeIpModeEnum, EdgePortTypeEnum } from '@acx-ui/rc/utils'

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
      gateway: '1.1.1.1',
      corePortEnabled: false
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
      gateway: '',
      corePortEnabled: true
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
      gateway: '',
      corePortEnabled: false
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
      gateway: '',
      corePortEnabled: false
    },
    {
      id: '081a71a7-aaad-4a13-967b-1c82166de11a',
      name: 'port2',
      mac: '00:0c:29:b6:ad:18',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: true,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '5.5.5.5',
      subnet: '255.255.255.0',
      gateway: '',
      corePortEnabled: false
    }
  ]
}

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

export const mockEdgeOnlyLanPortConfig = _.cloneDeep(mockEdgePortConfigWithStatusIp)
mockEdgeOnlyLanPortConfig.ports.splice(0, 1)
mockEdgeOnlyLanPortConfig.ports[0].gateway = '2.2.2.2'

export const mockedEdgeSdLanDataList = [{
  id: 'mocked-cf-1',
  edgeId: '96B968BD2C76ED11EEA8E4B2E81F537A94',
  corePortMac: '00:0c:29:b6:ad:04'
}] as EdgeSdLanViewData[]

export const mockedCorePortLostEdgeSdLanDataList = [{
  id: 'mocked-cf-2',
  edgeId: '96BD19BB3B5CE111EE80500E35957BEDC3',
  corePortMac: ''
}] as EdgeSdLanViewData[]