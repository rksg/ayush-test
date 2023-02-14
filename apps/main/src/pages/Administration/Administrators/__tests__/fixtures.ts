export const fakedAdminLsit = [
  {
    id: '0587cbeb13404f3b9943d21f9e1d1e3e',
    email: 'amy.cheng@commscope.com',
    role: 'PRIME_ADMIN',
    delegateToAllECs: true,
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
    delegatedTo: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    type: 'MSP',
    status: 'ACCEPTED',
    delegatedBy: 'abc@email.com',
    delegatedToName: 'FisrtName 1551'
  }
]

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

export const fakeMSPECAdmin = {
  email: 'aaa.chengi@gmail.com',
  user_name: 'aaa.cheng@gmail.com',
  first_name: 'Hey',
  last_name: 'ABC'
}