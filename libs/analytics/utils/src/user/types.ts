
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
}
export type Invitation = {
  accountName: string
  role: string
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
  role: 'admin' | 'network-admin' | 'report-only'
  resourceGroupId: string
  isTrial: boolean
  isRADEOnly: boolean
  permissions: Permissions
  settings: Settings
}

export type Permissions = {
  'view-analytics': boolean
  'view-report-controller-inventory': boolean
  'view-data-explorer': boolean
  'manage-service-guard': boolean
  'manage-call-manager': boolean
  'manage-mlisa': boolean
  'manage-occupancy': boolean
  'manage-label': boolean
  'manage-tenant-settings': boolean
  'manage-config-recommendation': boolean
  'franchisor': boolean
}

export type Settings = {
  'sla-p1-incidents-count': string
  'sla-guest-experience': string
  'sla-brand-ssid-compliance': string
  'brand-ssid-compliance-matcher': string
  franchisor: string
  franchisee: string
  zone: string
}

export type ManagedUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  accountId: string
  accountName: string
  role: 'admin' | 'network-admin' | 'report-only'
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
