import { EdgeIpModeEnum, EdgePortTypeEnum, EdgeStatusSeverityEnum } from '../models/EdgeEnum'

export interface EdgeGeneralSetting {
  description: string
  edgeGroupId: string
  name: string
  serialNumber?: string
  venueId?: string
  tags: string // TODO when tags component is ready need to change type to array
}

export interface EdgeResourceUtilization {
  cpuTotal?: number
  cpuUsed?: number
  memTotal?: number
  memUsed?: number
  diskTotal?: number
  diskUsed?: number
}
export interface Edge extends EdgeResourceUtilization {
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
  description?: string
  fwVersion?: string
}
export interface EdgeStatus extends EdgeResourceUtilization {
  serialNumber: string
  venueId: string
  venueName: string
  name: string
  description?: string
  model: string
  type: string
  tags: string[]
  deviceStatus: string
  deviceStatusSeverity: string
  ip: string
  ports: string
  fwVersion?: string
}
export interface EdgeDetails {
  serialNumber: string
  venueId: string
  name: string
  description: string
  softDeleted: boolean
  model: string
  updatedDate: string
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

export interface EdgeStaticRoute {
  id: string
  destIp: string
  destSubnet: string
  nextHop: string
}

export interface EdgeStaticRouteConfig {
  routes: EdgeStaticRoute[]
}

export interface EdgePortStatus {
  type: EdgePortTypeEnum.UNCONFIGURED | EdgePortTypeEnum.WAN | EdgePortTypeEnum.LAN
  portId: string
  name:string
  status: string
  adminStatus:string
  mac:string
  speedKbps:number
  duplex:string
  ip: string
  sortIdx: number
}

export interface EdgeStatusSeverityStatistic {
  summary: {
    [key in EdgeStatusSeverityEnum]?: number
  },
  totalCount: number
}
