export enum OltStatusEnum {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown' // GUI only
}

export enum OltCageStateEnum {
  UP = 'up',
  DOWN = 'down',
}

export enum OltSlotType {
  NT = 'NT',
  LT = 'LT',
  ONT = 'ONT'
}

export enum CageDetailsTabType {
  PANEL = 'panel',
  PORTS = 'ports',
  CLIENTS = 'clients'
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
  clientDetails?: OltOntClient[]
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
  clientCount?: number
  taggedVlan?: string[]
  untaggedVlan?: string[]
}

export interface OltOntClient {
  macAddress: string
  hostname: string
  port: string
}
