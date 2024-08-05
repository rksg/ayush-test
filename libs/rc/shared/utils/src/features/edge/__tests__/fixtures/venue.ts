export const mockVenueOptions = {
  fields: ['name', 'id', 'edges'],
  totalCount: 3,
  page: 1,
  data: [
    { id: 'mock_venue_1', name: 'Mock Venue 1', edges: 1 },
    { id: 'mock_venue_2', name: 'Mock Venue 2', edges: 0 },
    { id: 'mock_venue_3', name: 'Mock Venue 3', edges: 1 }
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