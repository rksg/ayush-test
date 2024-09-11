import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEdgeHqosProfilesApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'edgeHqosProfilesApi',
  tagTypes: ['EdgeHqosProfiles'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})