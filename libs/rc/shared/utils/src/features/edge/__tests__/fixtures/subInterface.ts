
import { ClusterSubInterfaceSettings, LagSubInterface, NodeSubInterfaces, PortSubInterface } from '../../../../types/edge'

import { EdgeGeneralFixtures } from '.'

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

const { mockedHaNetworkSettings } = EdgeGeneralFixtures
const generateMockedClusterSubInterfaceSettings = (): ClusterSubInterfaceSettings => {
  const clusterSubInterfaceSettings: ClusterSubInterfaceSettings = {
    nodes: []
  }

  mockedHaNetworkSettings.lagSettings.forEach((lagSetting, index) => {
    const node: NodeSubInterfaces = {
      serialNumber: lagSetting.serialNumber,
      ports: [],
      lags: []
    }

    lagSetting.lags.forEach(lag => {
      const lagSubInterface: LagSubInterface = {
        lagId: lag.id,
        subInterfaces: [{
          id: `sub_if_lag_${lag.id}`,
          vlan: 200 + index,
          portType: lag.portType,
          ipMode: lag.ipMode,
          ip: lag.ip,
          subnet: lag.subnet
        }]
      }
      node.lags.push(lagSubInterface)
    })

    const portSetting = mockedHaNetworkSettings.portSettings.find(
      portSetting => portSetting.serialNumber === lagSetting.serialNumber
    )

    if (portSetting) {
      portSetting.ports.forEach(port => {
        const portSubInterface: PortSubInterface = {
          portId: port.id,
          subInterfaces: [{
            id: `sub_if_port_${port.id}`,
            vlan: 100 + index,
            portType: port.portType,
            ipMode: port.ipMode,
            ip: port.ip,
            subnet: port.subnet
          }]
        }
        node.ports.push(portSubInterface)
      })
    }

    clusterSubInterfaceSettings.nodes.push(node)
  })

  return clusterSubInterfaceSettings
}
export const mockedClusterSubInterfaceSettings = generateMockedClusterSubInterfaceSettings()

export const mockEdgeSubInterfacesStatus = {
  fields: ['subnet','vlan','ip','name','serialNumber','type','sortIdx','mac','status','ipMode'],
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
      ipMode: 'Static',
      subnet: '255.255.255.128',
      vlan: '4',
      interfaceName: 'port1'
    },{
      serialNumber: 'edge-serialnum',
      sortIdx: 1,
      name: '',
      status: 'Up',
      type: 'LAN',
      mac: 'AA:BB:CC:DD:EE:FF',
      ip: '',
      ipMode: 'DHCP',
      subnet: '',
      vlan: '3',
      interfaceName: 'port2'
    }]
}

export const mockEdgeLagSubInterfacesStatus = {
  fields: ['status','portType','subnet','ip','ipMode','vlan'],
  totalCount: 2,
  page: 1,
  data: [
    {
      serialNumber: 'edge-serialnum',
      name: '',
      status: 'Up',
      portType: 'LAN',
      mac: 'AA:BB:CC:DD:EE:FF',
      ip: '1.1.1.1/25',
      ipMode: 'Static',
      subnet: '255.255.255.128',
      vlan: '4'
    },{
      serialNumber: 'edge-serialnum',
      name: '',
      status: 'Up',
      portType: 'LAN',
      mac: 'AA:BB:CC:DD:EE:FF',
      ip: '',
      ipMode: 'DHCP',
      subnet: '',
      vlan: '3'
    }]
}
