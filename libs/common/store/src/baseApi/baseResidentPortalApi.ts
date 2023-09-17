import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseResidentPortalApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'residentPortalApi',
  tagTypes: ['ResidentPortal'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})
