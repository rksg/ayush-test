import { MFAStatus, MFAMethod } from '../models/MFAEnum'

// DEPRECATED
export interface MFASession {
  tenantId?: string
  tenantStatus: MFAStatus
  mfaMethods: MFAMethod[]
  recoveryCodes?: string[]
  userId: string
  contactId?: string
}