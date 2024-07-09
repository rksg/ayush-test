export interface WifiOperatorViewModel {
  id: string
  name: string
  domainNames: string[]
  friendlyNames: FriendlyName[]
  friendlyNameCount: number
  wifiNetworkIds?: string[]
  networkCount: number
  tenantId: string
}

export interface FriendlyName {
  name: string,
  language: string
}

export interface WifiOperator {
  id: string
  name: string
  domainNames: string[]
  friendlyNames: FriendlyName[]
  tenantId: string
}

export interface WifiOperatorContext {
  id?: string,
  policyName: string,
  domainNames: string
  friendlyNames: FriendlyName[]
}

export interface WifiOperatorDetailContextType {
  filtersId: string[],
  policyName: string,
  setFiltersId: (filtersId: string[]) => void
  setPolicyName: (policyName: string) => void
}

export enum WifiOperatorConstant {
  DefaultProfile = 'Default profile'
}