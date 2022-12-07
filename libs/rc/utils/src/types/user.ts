export interface UserSettings {
  [key: string]: string
}

export interface UserProfile {
  region: string,
  pver: string,
  companyName: string,
  firstName: string,
  lastName: string,
  username: string,
  dateFormat: string,
  email: string,
  tenantId: string,
  varTenantId: string,
  adminId: string,
}
