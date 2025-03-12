import { ExtendedKeyUsages } from '@acx-ui/rc/utils'

export const aaaData = {
  id: 'policy-id',
  name: 'test2',
  type: 'AUTHENTICATION',
  primary: {
    ip: '2.3.3.4',
    port: 1087,
    sharedSecret: 'xxxxxxxx'
  },
  secondary: {
    ip: '2.3.3.4',
    port: 1088,
    sharedSecret: 'xxxxxxxx'
  },
  tags: ['xxdd']
}
export const successResponse = { requestId: 'request-id', id: '2', name: 'test2' }
export const aaaList = {
  page: 1,
  totalCount: 5,
  data: [
    {
      name: 'test1',
      type: 'AUTHENTICATION',
      primary: '1.1.1.2:1812',
      id: '1'
    },
    {
      name: 'policy-id',
      type: 'AUTHENTICATION',
      primary: '2.3.3.4:101',
      secondary: '2.3.3.4:1187',
      id: '2'
    },
    {
      name: 'aaa2',
      type: 'AUTHENTICATION',
      primary: '1.1.1.1:1812',
      id: '9f1ce5aecc834f0f95d3df1e97f85f19'
    },
    {
      name: 'aaa-temp',
      type: 'AUTHENTICATION',
      primary: '2.2.2.2:1812',
      id: '3e9e139d6ef3459c95ab547acb1672b5'
    },
    {
      name: 'aaa-temp1',
      type: 'AUTHENTICATION',
      primary: '1.1.1.19:1805',
      id: '343ddabf261546258bc46c049e0641e5'
    }
  ]
}
export const aaaTemplateList = {
  page: 1,
  totalCount: 2,
  data: [
    {
      name: 'test1',
      type: 'AUTHENTICATION',
      primary: '1.1.1.2:1812',
      id: '1'
    },
    {
      name: 'policy-id',
      type: 'AUTHENTICATION',
      primary: '2.3.3.4:101',
      secondary: '2.3.3.4:1187',
      id: '2'
    }
  ]
}

export const caList = {
  page: 1,
  totalCount: 2,
  data: [
    {
      id: '1',
      name: 'CA-1',
      status: ['VALID']
    },
    {
      id: '2',
      name: 'CA-2',
      status: ['VALID']
    }
  ]
}

export const certList = {
  page: 1,
  totalCount: 2,
  data: [
    {
      id: '1',
      name: 'Server-Cert-1',
      commonName: 'Server-Cert-1',
      extendedKeyUsages: [ExtendedKeyUsages.SERVER_AUTH],
      status: ['VALID']
    },
    {
      id: '2',
      name: 'Client-Cert-1',
      commonName: 'Client-Cert-1',
      extendedKeyUsages: [ExtendedKeyUsages.CLIENT_AUTH],
      status: ['VALID']
    }
  ]
}

export const radiusCaRef = {
  page: 1,
  totalCount: 1,
  data: [
    {
      id: '1',
      name: 'CA-1',
      status: ['VALID']
    }
  ]
}

export const radiusClientCertRef = {
  page: 1,
  totalCount: 1,
  data: [
    {
      id: '2',
      name: 'Client-Cert-1',
      commonName: 'Client-Cert-1',
      extendedKeyUsages: [ExtendedKeyUsages.CLIENT_AUTH],
      status: ['VALID']
    }
  ]
}

export const radiusServerCertRef = {
  page: 1,
  totalCount: 1,
  data: [
    {
      id: '1',
      name: 'Server-Cert-1',
      commonName: 'Server-Cert-1',
      extendedKeyUsages: [ExtendedKeyUsages.SERVER_AUTH],
      status: ['VALID']
    }
  ]
}

export const validateErrorResponse = [{
  code: '',
  message: 'Occured Some Error',
  object: 'radiusProfiles.xxxxxxx'
}, {
  code: 'WIFI-10200',
  message: 'Authentication Profile Mismatch [Shared Secret on Primary has changed]',
  object: 'radiusProfiles.authRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 10,
      sharedSecret: '99999'
    },
    id: '007d6854e6294e97882b432185c1abd9'
  }
}, {
  code: 'WIFI-10200',
  message: 'Accounting Profile Mismatch [Shared Secret on Primary has changed]',
  object: 'radiusProfiles.accountingRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 20,
      sharedSecret: '88888'
    },
    id: '3e90174d344749b1a1e36a1fd802510c' }
}, {
  code: 'WIFI-10200',
  message: 'multiple conflict xxxxx Authentication Profile Mismatch xxxxxx',
  object: 'radiusProfiles.accountingRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 10,
      sharedSecret: '99999'
    },
    id: '007d6854e6294e97882b432185c1abd9' }
}, {
  code: 'WIFI-10200',
  message: 'Authentication Profile Mismatch xxxxxx multiple conflict xxxxxx',
  object: 'radiusProfiles.authRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 20,
      sharedSecret: '88888'
    },
    id: '007d6854e6294e97882b432185c1abd9' }
}]
