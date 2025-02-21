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
  AP_GROUP = 'AP_GROUP',
  ETHERNET_PORT_PROFILE = 'ETHERNET_PORT'
}

export enum AccessControlPolicyForTemplateCheckType {
  L2_ACL = 'L2_ACL',
  L3_ACL = 'L3_ACL',
  DEVICE_POLICY = 'DEVICE_POLICY',
  APPLICATION_POLICY = 'APPLICATION_POLICY'
}

export enum ConfigTemplateDriftType {
  DRIFT_DETECTED = 'DRIFT_DETECTED',
  IN_SYNC = 'IN_SYNC'
}

export interface ConfigTemplate {
  id?: string,
  name: string,
  createdBy: string,
  createdOn: number,
  appliedOnTenants?: string[],
  type: ConfigTemplateType,
  lastModified: number,
  lastApplied?: number,
  driftStatus?: ConfigTemplateDriftType
  isEnforced?: boolean
}

export interface ApplyConfigTemplatePaylod {
  overrides: Array<{ [key in string]: string | number | boolean | [] }>
}

export type ConfigTemplateDriftValueType = string | number | boolean | null | undefined

// eslint-disable-next-line max-len
export type ConfigTemplateDriftPair = { template: ConfigTemplateDriftValueType, instance: ConfigTemplateDriftValueType }

export type ConfigTemplateDriftRecord = {
  path: string,
  data: ConfigTemplateDriftPair
}

export type ConfigTemplateDriftSet = {
  diffName: string,
  diffData: ConfigTemplateDriftRecord[]
}

// ----- ConfigTemplateDriftsResponse example -----
// [
//   {
//     diffName: 'WifiNetwork',
//     diffData: [
//       {
//         path: '/wlan/advancedCustomization/qosMirroringEnabled',
//         data: {
//           template: true,
//           instance: false
//         }
//       },
//       {
//         path: '/wlan/ssid',
//         data: {
//           template: 'test-int',
//           instance: 'nms-test-int'
//         }
//       }
//     ]
//   },
//   {
//     diffName: 'RadiusOnWifiNetwork',
//     diffData: [
//       {
//         path: '/id',
//         data: {
//           template: 'radius-template-id',
//           instance: 'radius-server-id'
//         }
//       },
//       {
//         path: '/idName',
//         data: {
//           template: 'radius-template-name',
//           instance: 'radius-server-name'
//         }
//       }
//     ]
//   }
// ]
export type ConfigTemplateDriftsResponse = ConfigTemplateDriftSet[]


export interface EnforceableFields {
  isEnforced?: boolean // It indicates whether the network template/instance is enforced
  isManagedByTemplate?: boolean // It indicates whether the venue is derived from a template
}

export type AllowedCloneTemplateTypes =
  ConfigTemplateType.NETWORK |
  ConfigTemplateType.VENUE

export const allowedCloneTemplateTypesSet = new Set<ConfigTemplateType>([
  ConfigTemplateType.NETWORK,
  ConfigTemplateType.VENUE
])
