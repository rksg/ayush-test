import { ExtendedKeyUsages } from '@acx-ui/rc/utils'

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
