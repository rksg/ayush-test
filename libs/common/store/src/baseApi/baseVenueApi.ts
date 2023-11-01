import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseVenueApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'venueApi',
  tagTypes: ['Venue', 'Device', 'VenueFloorPlan', 'AAA', 'ExternalAntenna', 'VenueRadio',
    'PropertyConfigs', 'PropertyUnit'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})
