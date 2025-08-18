export interface NetworkActivationType {
  [venueId: string]: {
    networkId: string
    networkName: string
    tunnelProfileId?: string
  }[]
}

export enum ApplyTo {
  MY_ACCOUNT = 'myAccount',
  MY_CUSTOMERS = 'myCustomers'
}

export interface EdgeSdLanFormType {
  id?: string
  name: string
  tunnelProfileId: string
  activatedNetworks: NetworkActivationType
}

export interface MspEdgeSdLanFormType extends EdgeSdLanFormType {
  applyTo: ApplyTo[]
  tunnelTemplateId?: string
  activatedNetworkTemplates?: NetworkActivationType
  ecTenantIds?: string[]
}