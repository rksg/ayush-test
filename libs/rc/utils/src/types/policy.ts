export enum PolicyType {
  ACCESS_CONTROL = 'Access Control',
  VLAN_POOL = 'VLAN Pool',
  ROGUE_AP_DETECTION = 'Rouge AP detection',
  SYSLOG = 'Syslog',
  AAA = 'AAA',
  CLIENT_ISOLATION = 'Client Isolation'
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
