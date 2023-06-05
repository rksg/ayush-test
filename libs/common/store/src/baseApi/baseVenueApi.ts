import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseVenueApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'venueApi',
  tagTypes: ['Venue', 'Device', 'VenueFloorPlan', 'AAA', 'ExternalAntenna', 'VenueRadio',
    'PropertyConfigs', 'PropertyUnit'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})
