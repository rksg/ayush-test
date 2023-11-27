import { NetworkTypeEnum } from '@acx-ui/rc/utils'

export const mockNetworkSaveData = {
  fields: ['venueId', 'networkId'],
  totalCount: 3,
  page: 1,
  data: [
    { networkId: 'network_1', venueId: 'venue_00002' },
    { networkId: 'network_2', venueId: 'venue_00002' },
    { networkId: 'network_3', venueId: 'venue_00005' }
  ]
}

export const mockDeepNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    { name: 'MockedNetwork 1', id: 'network_1', type: NetworkTypeEnum.DPSK },
    { name: 'MockedNetwork 2', id: 'network_2', type: NetworkTypeEnum.PSK },
    { name: 'MockedNetwork 3', id: 'network_3', type: NetworkTypeEnum.OPEN }
  ]
}