export * from './macRegistrarionList'
export * from './rogueApDetectionPolicy'
export * from './vlanPoolPolicy'
export * from './clientIsolationPolicy'
export * from './syslogPolicy'
export * from './accessControl'
export * from './rulesManagement'
export * from './radiusAttributeGroup'

export enum PolicyType {
  ACCESS_CONTROL = 'Access Control',
  VLAN_POOL = 'VLAN Pools',
  ROGUE_AP_DETECTION = 'Rogue AP Detection',
  SYSLOG = 'Syslog',
  AAA = 'AAA',
  CLIENT_ISOLATION = 'Client Isolation',
  MAC_REGISTRATION_LIST = 'MAC Registration List',
  ADAPTIVE_POLICY = 'Adaptive Policy'
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
