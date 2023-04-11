import { DetailLevel, UserProfile } from '@acx-ui/user'
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
  adminId: 'f5ca6ac1a8cf4929ac5b78d6a1392599',
  support: false,
  dogfood: false
} as UserProfile

export const fakeNonPrimeAdminUserProfile = {
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
  firstName: '',
  lastName: '',
  username: 'erp.cheng@email.com',
  role: 'ADMIN',
  roles: ['ADMIN'],
  detailLevel: DetailLevel.DEBUGGING,
  dateFormat: 'mm/dd/yyyy',
  email: 'erp.cheng@email.com',
  var: false,
  tenantId: '8c36a0a9ab9d4806b060e112205add6f',
  varTenantId: '8c36a0a9ab9d4806b060e112205add6f',
  adminId: 'f5ca6ac1a8cf4929ac5b78d6a1392599',
  support: false,
  dogfood: false
}


export const fakedAdminLsit = [
  {
    id: '0587cbeb13404f3b9943d21f9e1d1e3e',
    email: 'abc.cheng@email.com',
    role: 'PRIME_ADMIN',
    delegateToAllECs: true,
    detailLevel: 'debug'
  },
  {
    id: '0587cbeb13404f3b9943d21f9e1d1r6r',
    email: 'erp.cheng@email.com',
    role: 'ADMIN',
    delegateToAllECs: false,
    detailLevel: 'debug'
  },
  {
    id: 'f5ca6ac1a8cf4929ac5b78d6a1392599',
    email: 'dog1551@email.com',
    name: 'FisrtName 1551',
    lastName: 'LastName 1551',
    role: 'PRIME_ADMIN',
    delegateToAllECs: true,
    detailLevel: 'debug'
  }
]

export const fakeMSPAdminList = [
  {
    id: '22322506ed764da2afe726885845a359',
    createdDate: '2023-01-31T03:28:35.448+00:00',
    updatedDate: '2023-01-31T03:28:35.448+00:00',
    delegatedTo: 'f5ca6ac1a8cf4929ac5b78d6a1392599',
    type: 'MSP',
    status: 'ACCEPTED',
    delegatedBy: 'abc@email.com',
    delegatedToName: 'FisrtName 1551'
  }
]

export const fakeMSPECAdminList = [
  {
    id: 'f126778d406547c7b0944e845e98dbb2',
    email: 'bbb.chengi@gmail.com',
    name: 'Ya',
    lastName: 'DEF',
    role: 'PRIME_ADMIN',
    delegateToAllECs: true,
    detailLevel: 'debug'
  },
  {
    id: '7fbc3cacb7274a6986755795e1d3be0e',
    email: 'aaa.chengi@gmail.com',
    name: 'Hi',
    lastName: 'ABC',
    role: 'PRIME_ADMIN',
    delegateToAllECs: true,
    detailLevel: 'debug'
  }
]

export const fakeMSPECAdmin = {
  email: 'aaa.chengi@gmail.com',
  user_name: 'aaa.cheng@gmail.com',
  first_name: 'Hi',
  last_name: 'ABC'
}

export const fakeDelegationList = [
  {
    id: 'ffc2146b0f9041fa85caec2537a57d09',
    createdDate: '2023-02-13T11:51:07.793+00:00',
    updatedDate: '2023-02-13T11:51:07.793+00:00',
    delegatedTo: '3fde9aa0ef9a4d2181394095725d27a5',
    type: 'VAR',
    status: 'INVITED',
    delegatedBy: 'dog1551@email.com',
    delegatedToName: 'RUCKUS NETWORKS, INC',
    delegatedToAdmin: 'amy.cheng@ruckuswireless.com'
  }
]

export const fakeFindDelegationResponse = {
  externalId: '0015000000GlI7SAAV',
  name: 'RUCKUS NETWORKS, INC',
  created: '2007-01-15T01:34:55.000+0000',
  externalModifiedDate: '2023-02-10T00:33:36.000+0000',
  streetAddress: '350 W JAVA DR',
  stateOrProvince: 'CA',
  country: 'United States',
  city: 'SUNNYVALE',
  postalCode: '94089',
  phoneNumber: '+116502654200',
  faxNumber: '(408) 738-2065',
  var: false,
  eda: false
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
    mfaStatus: 'DISABLED',
    recoveryCodes: '["825910","333815","825720","919107","836842"]' },
  preferences: '{"global":{"mapRegion":"UA"}}',
  ruckusUser: false,
  isActivated: true,
  status: 'active',
  tenantType: 'REC'
}

// export const fakeMspEcProfile = {
//   msp_label: 'aaa.chengi',
//   name: 'ABC',
//   street_address: '350 W Java Dr, Sunnyvale, CA 94089, USA',
//   state: 'California',
//   country: 'United States',
//   city: 'Sunnyvale',
//   service_effective_date: '2023-02-08 08:34:14Z',
//   service_expiration_date: '2023-03-30 06:59:59Z',
//   is_active: 'true',
//   tenant_id: '350f3089a8e34509a2913c550faffa7e',
//   parent_tenant_id: '3061bd56e37445a8993ac834c01e2710',
//   tenant_type: 'MSP_EC'
// }

export const fakeMspEcProfile = {
  msp_label: '',
  name: '',
  service_effective_date: '',
  service_expiration_date: '',
  is_active: 'false'
}
