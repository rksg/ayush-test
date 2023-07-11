export const mockedTunnelProfileViewData = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'tunnelProfileId1',
      name: 'tunnelProfile1',
      tags: ['tag1'],
      mtuType: 'MANUAL',
      mtuSize: 1450,
      forceFragmentation: true,
      networkSegmentationIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2']
    },
    {
      id: 'tunnelProfileId2',
      name: 'tunnelProfile2',
      tags: ['tag2'],
      mtuType: 'AUTO',
      mtuSize: 0,
      forceFragmentation: false,
      networkSegmentationIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2']
    },
    {
      id: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      name: 'Default',
      tags: ['tag2'],
      mtuType: 'AUTO',
      mtuSize: 0,
      forceFragmentation: false,
      networkSegmentationIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2']
    }
  ]
}

export const mockedDefaultTunnelProfileViewData = {
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      name: 'Default',
      tags: ['tag2'],
      mtuType: 'AUTO',
      mtuSize: 0,
      forceFragmentation: false,
      networkSegmentationIds: ['nsg1', 'nsg2'],
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
  forceFragmentation: true,
  ageTimeMinutes: 20
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

export const mockedNetworkViewData = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'networkId1',
      name: 'TestNetwork1',
      nwSubType: 'dpsk',
      venues: {
        count: 1,
        names: ['venue1']
      }
    },
    {
      id: 'networkId2',
      name: 'TestNetwork2',
      nwSubType: 'dpsk',
      venues: {
        count: 1,
        names: ['venue1']
      }
    }
  ]
}