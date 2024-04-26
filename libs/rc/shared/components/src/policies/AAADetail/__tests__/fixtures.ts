export const aaaServerNetworkList = {
  fields: [
    'networkId',
    'networkName'
  ],
  totalCount: 4,
  page: 1,
  data: [
    {
      id: 1,
      networkId: '6',
      networkName: 'Network A',
      networkType: 'OPEN'
    },
    {
      id: 2,
      networkId: '3b11bcaffd6f4f4f9b2805b6fe24bf8d',
      networkName: 'Network B',
      networkType: 'GUEST',
      guestNetworkType: 'WISPr'
    },
    {
      id: 3,
      networkId: '3b11bcaffd6f4f4f9b2805b6fe24bf8f',
      networkName: 'Network C',
      networkType: 'AAA'
    },
    {
      id: 4,
      networkId: '3b11bcaffd6f4f4f9b2805b6fe24bf8g',
      networkName: 'Network E',
      networkType: 'GUEST',
      guestNetworkType: 'Cloudpath'
    }
  ]
}
export const aaaServerDetail = {
  id: 1,
  networkIds: [] as string[],
  name: 'test',
  type: 'AUTHENTICATION',
  primary: {
    ip: '2.2.2.2',
    port: 101,
    sharedSecret: 'xxxxxxxx'
  },
  secondary: {
    ip: '2.2.2.2',
    port: 102,
    sharedSecret: 'xxxxxxxx'
  },
  tags: ['123','345']
}
