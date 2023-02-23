export * from './macRegistrarionList'
export * from './rogueApDetectionPolicy'
export * from './aaaPolicy'
export * from './vlanPoolPolicy'
export * from './clientIsolationPolicy'
export * from './syslogPolicy'
export * from './accessControl'
export * from './rulesManagement'
export * from './radiusAttributeGroup'

export { DeviceTypeEnum } from '../../models/DeviceTypeEnum'
export { OsVendorEnum } from '../../models/OsVendorEnum'

export enum PolicyType {
  ACCESS_CONTROL = 'Access Control',
  VLAN_POOL = 'VLAN Pools',
  ROGUE_AP_DETECTION = 'Rogue AP Detection',
  SYSLOG = 'Syslog',
  AAA = 'AAA',
  CLIENT_ISOLATION = 'Client Isolation',
  MAC_REGISTRATION_LIST = 'MAC Registration List',
  LAYER_2_POLICY = 'Layer 2 Policy',
  LAYER_3_POLICY = 'Layer 3 Policy',
  APPLICATION_POLICY = 'Application Policy',
  DEVICE_POLICY = 'Device Policy',
  ADAPTIVE_POLICY = 'Adaptive Policy',
  RADIUS_ATTRIBUTE_GROUP = 'RADIUS Attribute Group',
  ADAPTIVE_POLICY_SET = 'Adaptive Policy Set'
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
