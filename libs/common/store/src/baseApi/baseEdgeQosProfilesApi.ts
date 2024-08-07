import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEdgeQosProfilesApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'edgeQosProfilesApi',
  tagTypes: ['EdgeQosProfiles'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})