import { NetworkTypeEnum } from '@acx-ui/rc/utils'

export const mockedVenueList = {
  fields: ['name', 'id'],
  totalCount: 5,
  page: 1,
  data: [
    {
      id: 'venue_00001',
      name: 'My-Venue',
      edges: 0
    },
    {
      id: 'venue_00002',
      name: 'airport',
      edges: 1
    },
    {
      id: 'venue_00003',
      name: 'MockedVenue 1',
      edges: 0
    },
    {
      id: 'venue_00004',
      name: 'MockedVenue 2',
      edges: 1
    },
    {
      id: 'venue_00005',
      name: 'SG office',
      edges: 1
    }
  ]
}

export const mockedTunnelProfileViewData = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: 'tunnelProfileId1',
      name: 'tunnelProfile1'
    },
    {
      id: 'tunnelProfileId2',
      name: 'tunnelProfile2'
    },
    {
      id: 'tunnelProfileId3',
      name: 'Default'
    }
  ]
}

export const mockNetworkSaveData = {
  fields: ['venueId', 'networkId'],
  totalCount: 3,
  page: 1,
  data: [
    { networkId: 'network_1', venueId: 'venue_00002' },
    { networkId: 'network_2', venueId: 'venue_00002' },
    { networkId: 'network_3', venueId: 'venue_00005' },
    { networkId: 'network_4', venueId: 'venue_00005' }
  ]
}

export const mockDeepNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    { name: 'MockedNetwork 1', id: 'network_1', type: NetworkTypeEnum.DPSK },
    { name: 'MockedNetwork 2', id: 'network_2', type: NetworkTypeEnum.PSK },
    { name: 'MockedNetwork 3', id: 'network_3', type: NetworkTypeEnum.OPEN },
    { name: 'MockedNetwork 4', id: 'network_4', type: NetworkTypeEnum.CAPTIVEPORTAL }
  ]
}

export const mockedNetworkViewData = {
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '8e22159cfe264ac18d591ea492fbc05a',
      name: 'amyNetwork',
      nwSubType: 'dpsk'
    }
  ]
}