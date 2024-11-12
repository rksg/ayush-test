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

export const fakeTenantDetails = {
  id: 'ee87b5336d5d483faeda5b6aa2cbed6f',
  createdDate: '2023-01-31T04:19:00.241+00:00',
  updatedDate: '2023-02-15T02:34:21.877+00:00',
  entitlementId: '140360222',
  maintenanceState: false,
  name: 'Dog Company 1551',
  externalId: '0012h00000NrlYAAAZ',
  upgradeGroup: 'production',
  tenantMFA: {
    mfaStatus: MFAStatus.ENABLED,
    recoveryCodes: ['825910','333815','825720','919107','836842'] },
  preferences: { global: { mapRegion: 'UA' } },
  ruckusUser: false,
  isActivated: true,
  status: 'active',
  tenantType: 'REC'
}
