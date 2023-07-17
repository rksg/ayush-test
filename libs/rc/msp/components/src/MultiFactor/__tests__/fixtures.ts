import { MFAStatus, MFAMethod } from '@acx-ui/user'

export const fakeRecoveryCodes = ['123456','287600','230200','791660','169111']
export const fakeMFAEnabledTenantDetail = {
  tenantStatus: MFAStatus.ENABLED,
  recoveryCodes: fakeRecoveryCodes,
  mfaMethods: [],
  userId: 'userId'
}

export const fakeMFAEnabledAdminDetail = {
  contactId: 'test@email.com',
  tenantStatus: MFAStatus.ENABLED,
  recoveryCodes: fakeRecoveryCodes,
  mfaMethods: [MFAMethod.EMAIL],
  userId: 'userId'
}

export const fakeMFADisabledTenantDetail = {
  tenantStatus: MFAStatus.DISABLED,
  recoveryCodes: [],
  mfaMethods: [],
  userId: 'userId'
}

export const fakeMFADisabledAdminDetail = {
  ...fakeMFADisabledTenantDetail
}
