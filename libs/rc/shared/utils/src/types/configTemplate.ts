export enum ConfigTemplateType {
  NETWORK = 'NETWORK',
  RADIUS = 'RADIUS',
  VENUE = 'VENUE',
  DPSK = 'DPSK',
  DHCP = 'DHCP',
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  LAYER_2_POLICY = 'L2_ACL',
  LAYER_3_POLICY = 'L3_ACL',
  DEVICE_POLICY = 'DEVICE_POLICY',
  APPLICATION_POLICY = 'APPLICATION_POLICY'
}

export enum AccessControlPolicyForTemplateCheckType {
  L2_ACL = 'L2_ACL',
  L3_ACL = 'L3_ACL',
  DEVICE_POLICY = 'DEVICE_POLICY',
  APPLICATION_POLICY = 'APPLICATION_POLICY'
}

export interface ConfigTemplate {
  id?: string,
  name: string,
  createdBy: string,
  createdOn: number,
  appliedOnTenants: string[],
  type: ConfigTemplateType,
  lastModified: number,
  lastApplied: number
}
