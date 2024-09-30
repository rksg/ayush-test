export enum ConfigTemplateType {
  NETWORK = 'NETWORK',
  RADIUS = 'RADIUS',
  VENUE = 'VENUE',
  DPSK = 'DPSK',
  DHCP = 'DHCP',
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  PORTAL = 'PORTAL',
  VLAN_POOL = 'VLAN_POOL',
  WIFI_CALLING = 'WIFI_CALLING',
  CLIENT_ISOLATION = 'CLIENT_ISOLATION',
  LAYER_2_POLICY = 'L2_ACL',
  LAYER_3_POLICY = 'L3_ACL',
  DEVICE_POLICY = 'DEVICE_POLICY',
  APPLICATION_POLICY = 'APPLICATION_POLICY',
  SYSLOG = 'SYSLOG',
  ROGUE_AP_DETECTION = 'ROGUE_AP',
  SWITCH_REGULAR = 'SWITCH_REGULAR',
  SWITCH_CLI = 'SWITCH_CLI',
  AP_GROUP = 'AP_GROUP'
}

export enum AccessControlPolicyForTemplateCheckType {
  L2_ACL = 'L2_ACL',
  L3_ACL = 'L3_ACL',
  DEVICE_POLICY = 'DEVICE_POLICY',
  APPLICATION_POLICY = 'APPLICATION_POLICY'
}

export enum ConfigTemplateDriftType {
  DRIFT_DETECTED = 'driftDetected',
  IN_SYNC = 'inSync'
}

export interface ConfigTemplate {
  id?: string,
  name: string,
  createdBy: string,
  createdOn: number,
  appliedOnTenants?: string[],
  type: ConfigTemplateType,
  lastModified: number,
  lastApplied: number,
  driftStatus?: ConfigTemplateDriftType
}

export interface ApplyConfigTemplatePaylod {
  overrides: Array<{ [key in string]: string | number | boolean | [] }>
}

export type TemplateInstanceDriftValue = string | number | boolean | null | undefined

// eslint-disable-next-line max-len
export type TemplateInstanceDriftPair = { template: TemplateInstanceDriftValue, instance: TemplateInstanceDriftValue }

export type TemplateInstanceDriftRecord = Record<string, TemplateInstanceDriftPair>

// TemplateInstanceDriftResponse type example:
// {
//   WifiNetwork: {
//     '/wlan/advancedCustomization/qosMirroringEnabled': {
//       template: true,
//       instance: false
//     }
//   },
//   RadiusOnWifiNetwork: {
//     '/id': {
//       template: 'radius-template-id',
//       instance: 'radius-server-id'
//     },
//     '/idName': {
//       template: 'radius-template-name',
//       instance: 'radius-server-name'
//     }
//   }
// }
export type TemplateInstanceDriftResponse = Record<string, TemplateInstanceDriftRecord>
