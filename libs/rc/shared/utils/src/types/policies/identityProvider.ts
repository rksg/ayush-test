export interface IdentityProvider {
  name: string
  naiRealms: { name: string }[]
  plmns?: { mcc: number, mnc: number }[]
  roamingConsortiumOIs?: { name: string, organizationId: string }[]
  authRadiusId: string
  accountingRadiusId?: string
}

export interface IdentityProviderViewModel {
  id: string
  name: string
  naiRealms: { name: string }[]
  plmns?: { mcc: number, mnc: number }[]
  roamingConsortiumOIs?: { name: string, organizationId: string }[]
  authRadiusId: string
  accountingRadiusId?: string
  networkIds?: string[]
  venueIds?: string[]
  tenantId: string
}
