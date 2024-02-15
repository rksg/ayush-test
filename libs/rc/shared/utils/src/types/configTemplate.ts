export enum ConfigTemplateType {
  NETWORK = 'NETWORK',
  RADIUS = 'RADIUS',
  VENUE = 'VENUE',
  DPSK = 'DPSK'
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
