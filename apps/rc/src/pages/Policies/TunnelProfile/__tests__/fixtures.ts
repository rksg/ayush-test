export const mockedTunnelProfileViewData = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'tunnelProfileId1',
      name: 'tunnelProfile1',
      tag: 'tag1',
      mtuType: 'MANUAL',
      mtuSize: 1450,
      forceFragmentation: true,
      networkSegmentIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2']
    },
    {
      id: 'tunnelProfileId2',
      name: 'tunnelProfile2',
      tag: 'tag2',
      mtuType: 'AUTO',
      mtuSize: 0,
      forceFragmentation: false,
      networkSegmentIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2']
    }
  ]
}

export const mockedNsgOptions = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'nsgId1',
      name: 'nsg1'
    },
    {
      id: 'nsgId2',
      name: 'nsg2'
    }
  ]
}
export const mockedTunnelProfileData = {
  id: 'tunnelProfileId1',
  name: 'tunnelProfile1',
  tag: 'test',
  mtuType: 'MANUAL',
  mtuSize: 1450,
  forceFragmentation: true
}
export const mockedNetworkOptions = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'networkId1',
      name: 'network1'
    },
    {
      id: 'networkId2',
      name: 'network2'
    }
  ]
}