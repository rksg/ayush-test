import { Moment } from 'moment-timezone'

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

export interface MacRegistrationPoolSaveData {
  autoCleanup?: boolean
  description?: string
  name?: string
  policyId?: string
  expirationType?: string
  expirationOffset?: number
  expirationDate?: string
  expirationEnabled?: boolean
  ssidRegex?: string
}

export interface MacRegistrationFormFields {
  expireDate: string
  expireAfter: number
  macAddress: string
  username: string
  devicename: string,
  listExpiration: number
  expireTimeUnit: string
}

export interface MacRegistrationPoolFormFields {
  name: string
  autoCleanup: boolean
  description: string
  policyId: string
  listExpiration: number
  expireDate: Moment
  expireAfter: number
  expireTimeUnit: string
  defaultAccess: string
}
