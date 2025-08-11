export enum OltStatusEnum {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown' // GUI only
}

export enum OltCageStateEnum {
  UP = 'up',
  DOWN = 'down',
}

export interface Olt {
  name: string
  status: OltStatusEnum
  vendor: string
  model: string
  serialNumber: string
  firmware: string
  ip: string
  venueId: string
  venueName: string
  adminPassword?: string
}

export interface OltCage {
  cage: string
  state: OltCageStateEnum
}

export interface OltOnt {
  id: string
  name: string
  poeClass: string
  ports: number
  usedPorts: number
  portDetails: OltOntPort[]

  model?: string //TODO
  profileName?: string
  version?: string
  uptime?: string
  poeUtilization?: string
}

export interface OltOntPort {
  portIdx: string
  status: OltCageStateEnum
  vlan: string[]
  poePower: number
}

