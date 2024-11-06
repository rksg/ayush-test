export const mockVenueOptions = {
  fields: ['name', 'id', 'edges', 'country', 'city'],
  totalCount: 3,
  page: 1,
  data: [
    {
      id: 'mock_venue_1',
      name: 'Mock Venue 1',
      edges: 1,
      country: 'TestCountry1',
      city: 'TestCity1'
    },
    {
      id: 'mock_venue_2',
      name: 'Mock Venue 2',
      edges: 0,
      country: 'TestCountry2',
      city: 'TestCity2'
    },
    {
      id: 'mock_venue_3',
      name: 'Mock Venue 3',
      edges: 1,
      country: 'TestCountry3',
      city: 'TestCity3'
    }
  ]
}

export const mockVenueList = {
  fields: ['id', 'country', 'city', 'aggregatedApStatus'],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'a307d7077410456f8f1a4fc41d861567',
      country: 'TestCountry1',
      city: 'TestCity1',
      aggregatedApStatus: []
    },
    {
      id: 'test-2',
      country: 'TestCountry2',
      city: 'TestCity2',
      aggregatedApStatus: []
    }
  ]
}

export const mockVenueOptionsForMutuallyExclusive = {
  fields: ['name', 'id', 'edges', 'country', 'city'],
  totalCount: 5,
  page: 1,
  data: [
    {
      id: 'mock_venue_1',
      name: 'Mock Venue 1',
      edges: 1,
      country: 'TestCountry1',
      city: 'TestCity1'
    },
    {
      id: 'mock_venue_2',
      name: 'Mock Venue 2',
      edges: 1,
      country: 'TestCountry2',
      city: 'TestCity2'
    },
    {
      id: 'mock_venue_3',
      name: 'Mock Venue 3',
      edges: 1,
      country: 'TestCountry3',
      city: 'TestCity3'
    },
    {
      id: 'mock_venue_4',
      name: 'Mock Venue 4',
      edges: 1,
      country: 'TestCountry4',
      city: 'TestCity4'
    },
    {
      id: 'mock_venue_5',
      name: 'Mock Venue 5',
      edges: 1,
      country: 'TestCountry5',
      city: 'TestCity5'
    }
  ]
}