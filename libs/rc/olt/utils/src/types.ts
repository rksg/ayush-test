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

export enum OltDetailsTabType {
  OVERVIEW = 'overview',
  ONTS = 'onts',
  CONFIGURATION = 'configuration'
}

export enum OntDetailsTabType {
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

export type DrawerKey = 'ontDetails' | 'editOnt' | 'manageOnts'
export type OntDetailsAction =
  | { type: 'SET_SELECTED_ONT'; payload: OltOnt | undefined }
  // | { type: 'SET_CURRENT_TAB'; payload: string }
  | { type: 'OPEN_DRAWER'; payload: DrawerKey }
  | { type: 'CLOSE_DRAWER'; payload: DrawerKey }
  // | { type: 'CLOSE_ALL_DRAWERS' }
