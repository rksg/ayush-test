import { Roles, permissions } from '../constants'

export type UserProfile = {
  firstName: string
  lastName: string
  email: string
  accountId: string
  userId: string
  invitations: Invitation[]
  tenants: Tenant[]
  selectedTenant: Tenant
  accountTier?: string
  betaEnabled?: boolean
  preferences?: {
    preferredLanguage: string
  }
}
export type Invitation = {
  accountName: string
  role: Roles
  type: string
  resourceGroupId: string
  firstName: string
  lastName: string
}
export type Tenant = {
  id: string
  name: string
  support: boolean
  type: 'tenant' | 'super-tenant'
  role: Roles
  resourceGroupId: string
  isTrial: boolean
  isRADEOnly: boolean
  permissions: Permissions
  settings: Settings
}

export type Permissions = Record<keyof typeof permissions, boolean>

export type Settings = {
  'sla-p1-incidents-count': string
  'sla-guest-experience': string
  'sla-brand-ssid-compliance': string
  'brand-ssid-compliance-matcher': string
  'sso': string
  'brand-name': string
  'lsp-name': string
  'property-name': string
}

export type ManagedUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  accountId: string
  accountName: string
  role: Roles
  tenantId: string
  resourceGroupId: string
  resourceGroupName: string
  updatedAt?: string
  type: null | string
  invitation: null | {
    state: 'pending' | 'accepted' | 'rejected',
    inviterUser: {
      firstName: string,
      lastName: string
    }
  }
}
