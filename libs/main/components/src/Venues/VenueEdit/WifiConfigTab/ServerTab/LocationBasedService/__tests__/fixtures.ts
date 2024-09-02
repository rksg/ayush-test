export const mockedTenantId = '__Tenant_ID__'
export const mockedVenueId = '__Venue_ID__'
export const mockedPolicyId1 = '__Policy_ID_1__'
export const mockedPolicyId2 = '__Policy_ID_2__'

export const dummyLbsServerProfileViewmodel1 = {
  id: mockedPolicyId1,
  name: 'LBS 1',
  lbsServerVenueName: 'lbsvenue01',
  server: 'abc.venue.ruckuslbs.com:8883'
}

export const dummyLbsServerProfileViewmodel2 = {
  id: mockedPolicyId2,
  name: 'LBS 2',
  lbsServerVenueName: 'lbsvenue02',
  server: 'xyz.venue.ruckuslbs.com:8883'
}

export const dummyTableResult = {
  totalCount: 2,
  page: 1,
  data: [{
    ...dummyLbsServerProfileViewmodel1,
    venueIds: []
  }, {
    ...dummyLbsServerProfileViewmodel2,
    venueIds: [mockedVenueId]
  }]
}
