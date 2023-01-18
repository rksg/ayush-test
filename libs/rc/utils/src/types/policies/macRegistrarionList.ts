import { Moment } from 'moment-timezone'

import { ExpirationDateEntity, ExpirationType } from '../components'

export interface MacRegistrationPool {
  id?: string
  autoCleanup: boolean
  description?: string
  enabled: boolean
  expirationEnabled?: boolean
  name: string
  ssidRegex?: string
  registrationCount: number
  policyId?: string
  expirationType?: ExpirationType
  expirationOffset?: number
  expirationDate?: string
  defaultAccess : string
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
  expiration: ExpirationDateEntity;
  ssidRegex?: string
}

export interface MacRegistration {
  id?: string
  email?: string
  expirationDate?: string
  location?: string
  macAddress: string
  revoked: boolean
  username?: string
  createdDate: string
  expiration?: ExpirationDateEntity
  deviceName?: string
}
