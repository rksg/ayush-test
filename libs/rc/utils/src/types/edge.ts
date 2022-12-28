import { EdgeIpModeEnum, EdgePortTypeEnum } from '../models'

export interface EdgeSaveData {
  description: string
  edgeGroupId: string
  name: string
  serialNumber?: string
  venueId?: string
  tags: string // TODO when tags component is ready need to change type to array
}

export interface EdgeViewModel {
  name: string
  deviceStatus: string
  type: string
  model: string
  serialNumber: string
  ip: string
  ports: string
  venueName: string
  venueId: string
  tags: string[]
}

export interface EdgePort {
  id: string
  portType: EdgePortTypeEnum.WAN | EdgePortTypeEnum.LAN | EdgePortTypeEnum.UNCONFIGURED
  name: string
  mac: string
  enabled: boolean
  ipMode: EdgeIpModeEnum.DHCP | EdgeIpModeEnum.STATIC
  ip: string
  subnet: string
  gateway: string
  natEnabled: boolean
}

export interface EdgePortConfig {
  ports: EdgePort[]
}

export interface EdgeSubInterface extends EdgePort {
  vlan: number
}

export interface EdgeDnsServers {
  primary: string
  secondary: string
}
