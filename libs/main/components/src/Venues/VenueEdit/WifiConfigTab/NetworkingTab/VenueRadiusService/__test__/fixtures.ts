export const mockRadiusData = {
  data: [
    {
      id: 'auth-1',
      name: 'Auth Server 1',
      type: 'AUTHENTICATION',
      venueIds: ['venue-1'],
      radSecOptions: { tlsEnabled: false }
    },
    {
      id: 'auth-2',
      name: 'Auth Server 2',
      type: 'AUTHENTICATION',
      venueIds: [],
      radSecOptions: { tlsEnabled: false }
    },
    {
      id: 'acct-1',
      name: 'Accounting Server 1',
      type: 'ACCOUNTING',
      venueIds: ['venue-1'],
      radSecOptions: { tlsEnabled: false }
    },
    {
      id: 'acct-2',
      name: 'Accounting Server 2',
      type: 'ACCOUNTING',
      venueIds: [],
      radSecOptions: { tlsEnabled: false }
    }
  ],
  totalCount: 4
}

export const mockRadiusDataWithTls = {
  data: [
    {
      id: 'auth-tls-1',
      name: 'Auth TLS Server',
      type: 'AUTHENTICATION',
      venueIds: ['venue-1'],
      radSecOptions: { tlsEnabled: true }
    }
  ],
  totalCount: 1
}