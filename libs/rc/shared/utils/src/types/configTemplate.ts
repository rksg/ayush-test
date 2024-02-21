export enum ConfigTemplateType {
  NETWORK = 'NETWORK',
  RADIUS = 'RADIUS',
  VENUE = 'VENUE',
  ACCESS_CONTROL_SET = 'ACCESS_CONTROL_SET',
  LAYER_2_POLICY = 'LAYER_2_POLICY',
  LAYER_3_POLICY = 'LAYER_3_POLICY',
  DEVICE_POLICY = 'DEVICE_POLICY',
  APPLICATION_POLICY = 'APPLICATION_POLICY'
}

export enum AccessControlPolicyType {
  LAYER_2_POLICY = 'LAYER_2_POLICY',
  LAYER_3_POLICY = 'LAYER_3_POLICY',
  DEVICE_POLICY = 'DEVICE_POLICY',
  APPLICATION_POLICY = 'APPLICATION_POLICY'
}

export interface ConfigTemplate {
  id?: string,
  name: string,
  createdBy: string,
  createdOn: number,
  ecTenants: string[],
  type: ConfigTemplateType,
  lastModified: number,
  lastApplied: number
}
