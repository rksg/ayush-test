
export type UserProfile = {
  firstName: string
  lastName: string
  email: string
  accountId: string
  userId: string
  invitations: Tenant[]
  tenants: Tenant[]
  permissions: Permissions
}

export type Tenant = {
  id: string
  name: string
  support: boolean
  role: string
  resourceGroupId: string
  isTrial: boolean
  isRADEOnly: boolean
  permissions: Permissions
  type: string
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