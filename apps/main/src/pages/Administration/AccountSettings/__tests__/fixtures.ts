import { DetailLevel, MFAStatus, UserProfile } from '@acx-ui/user'

export const fakeUserProfile = {
  region: '[NA]',
  allowedRegions: [
    {
      name: 'US',
      description: 'United States of America',
      link: 'https://dev.ruckus.cloud',
      current: true
    }
  ],
  externalId: '0032h00000LUqcoAAD',
  pver: 'acx-hybrid',
  companyName: 'Dog Company 1551',
  firstName: 'FisrtName 1551',
  lastName: 'LastName 1551',
  username: 'dog1551@email.com',
  role: 'PRIME_ADMIN',
  roles: ['PRIME_ADMIN'],
  detailLevel: DetailLevel.DEBUGGING,
  dateFormat: 'mm/dd/yyyy',
  email: 'dog1551@email.com',
  var: false,
  tenantId: '8c36a0a9ab9d4806b060e112205add6f',
  varTenantId: '8c36a0a9ab9d4806b060e112205add6f',
  adminId: '4159559db15c4027903d9c3d4bdb8a7e',
  support: false,
  dogfood: false,
  preferredLanguage: 'en-US'
} as UserProfile

export const fakeTenantDelegation = [
  {
    id: '23450f81d5c34d6caf166329aef67e45',
    delegatedTo: 'support',
    type: 'SUPPORT',
    status: 'ACCEPTED',
    delegatedBy: 'dog1551@email.com',
    expiryDate: '2023-01-30T11:26:48.101+00:00',
    createdDate: '2023-01-10T11:26:48.101+00:00',
    delegatedToName: 'Ruckus Support'
  }
]

export const fakeTenantDelegationResponse = {
  isAccessSupported: true,
  expiryDate: fakeTenantDelegation[0].expiryDate
}

export const fakeMFATenantDetail = {
  tenantStatus: MFAStatus.DISABLED,
  recoveryCodes: ['678490','287605','230202','791760','169187'],
  mfaMethods: [],
  userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7',
  enabled: false
}

export const fakeMspEcProfile = {
  msp_label: '',
  name: '',
  service_effective_date: '',
  service_expiration_date: '',
  is_active: 'false'
}

export const fakeRecoveryPassphrase = {
  psk: '3577576417249799',
  tenantId: '8c36a0a9ab9d4806b060e112205add6f',
  obsolete: false
}

export const fakePreference = {
  global: {
    mapRegion: 'TW'
  }
}
