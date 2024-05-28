export const mockVenueData = {
  fields: ['name', 'id'],
  totalCount: 3,
  page: 1,
  data: [
    { id: 'mock_venue_1', name: 'Mock Venue 1' },
    { id: 'mock_venue_2', name: 'Mock Venue 2' },
    { id: 'mock_venue_3', name: 'Mock Venue 3' }
  ]
}

export const mockClusterData = {
  fields: ['name', 'clusterId'],
  totalCount: 3,
  page: 1,
  data: [
    { clusterId: 'mock_cluster_1', name: 'Mock Cluster 1' },
    { clusterId: 'mock_cluster_2', name: 'Mock Cluster 2' },
    { clusterId: 'mock_cluster_3', name: 'Mock Cluster 3' }
  ]
}

export const mockedPersonaGroup = {
  id: 'testPersonaId',
  name: 'TestPersona',
  identityCount: 2,
  dpskPoolId: 'testDpskId',
  personas: [
    {
      id: 'c677cbb0-8520-421c-99b6-59b3cef5ebc1',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      name: 'mock-persona1'
    },
    {
      id: '1e7f81ab-9bb7-4db7-ae20-315743f83183',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      name: 'mock-persona2'
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
