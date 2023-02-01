export * from './macRegistrarionList'
export * from './rogueApDetectionPolicy'
export * from './aaaPolicy'
export * from './accessControl'

export enum PolicyType {
  ACCESS_CONTROL = 'Access Control',
  VLAN_POOL = 'VLAN Pool',
  ROGUE_AP_DETECTION = 'Rogue AP Detection',
  SYSLOG = 'Syslog',
  AAA = 'AAA',
  CLIENT_ISOLATION = 'Client Isolation',
  MAC_REGISTRATION_LIST = 'MAC Registration List'
}

export enum PolicyTechnology {
  WIFI = 'WI-FI',
  SWITCH = 'SWITCH'
}

export interface Policy {
  id: string
  name: string
  type: PolicyType
  technology: PolicyTechnology
  scope: number
  tags: string[]
}
