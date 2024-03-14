export enum ConfigTemplateType {
  NETWORK = 'NETWORK',
  RADIUS = 'RADIUS',
  VENUE = 'VENUE',
  DPSK = 'DPSK',
  DHCP = 'DHCP',
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  VLAN_POOL = 'VLAN_POOL'
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
