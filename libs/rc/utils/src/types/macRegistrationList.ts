export interface MacRegistration {
  id: string
  email: string
  expirationDate: string
  location: string
  macAddress: string
  revoked: boolean
  username: string
  devicename: string
}

export interface MacRegistrationPool {
  id: string
  autoCleanup: boolean
  description: string
  enabled: boolean
  expirationEnabled: boolean
  name: string
  priority: number
  ssidRegex: string
  macAddresses: number
  policyId: string
  expirationType: string
  expirationOffset: number
  expirationDate: string
}
