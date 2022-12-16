import { EdgePortTypeEnum } from '../models/EdgeEnum'

export interface EdgeGeneralSetting {
  description: string
  edgeGroupId: string
  name: string
  serialNumber?: string
  venueId: string
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
  dns1?: string
  dns2?: string
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
  portType: EdgePortTypeEnum.UNSPECIFIED | EdgePortTypeEnum.WAN | EdgePortTypeEnum.LAN
	portId: string
  portName:string
  status: string
  adminStatus:string
  mac:string
  speed:number    // kbps/s
  duplexSpeed:number
  ip: string
  portIndex?: number
}

export type EdgeDNS = string
