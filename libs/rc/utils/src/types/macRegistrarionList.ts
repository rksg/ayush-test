import { Moment } from 'moment-timezone'

export interface MacRegistrationPool {
  id?: string
  autoCleanup?: boolean
  description?: string
  enabled?: boolean
  expirationEnabled?: boolean
  name?: string
  priority?: number
  ssidRegex?: string
  registrationCount?: number
  policyId?: string
  expirationType?: string
  expirationOffset?: number
  expirationDate?: string
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
  // expireTimeUnit: 'MINUTES_AFTER_TIME' | 'HOURS_AFTER_TIME' | 'DAYS_AFTER_TIME' | 'WEEKS_AFTER_TIME' | 'MONTHS_AFTER_TIME' | 'YEARS_AFTER_TIME'
  defaultAccess: string
}

export interface MacRegistration {
  id?: string
  email?: string
  expirationDate?: string
  location?: string
  macAddress?: string
  revoked?: boolean
  username?: string
  deviceName?: string
  listExpiration?: number
}
