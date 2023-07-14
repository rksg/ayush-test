import { Moment } from 'moment-timezone'

import { ExpirationDateEntity, ExpirationType } from '../components'

export interface MacRegistrationPool {
  id?: string
  autoCleanup: boolean
  enabled: boolean
  expirationEnabled?: boolean
  name: string
  registrationCount: number
  policySetId?: string
  expirationType?: ExpirationType
  expirationOffset?: number
  expirationDate?: string
  defaultAccess : string
  networkIds?: string []
  associationIds?: string []
}

export interface MacRegistrationPoolFormFields {
  name: string
  autoCleanup: boolean
  policySetId: string
  listExpiration: number
  expireDate: Moment
  expireAfter: number
  expireTimeUnit: string
  defaultAccess: string
  expiration: ExpirationDateEntity
}

export interface MacRegistration {
  id?: string
  email?: string
  expirationDate?: string
  macAddress: string
  revoked: boolean
  username?: string
  createdDate: string
  expiration?: ExpirationDateEntity,
  identityId?: string
}
