import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseResidentPortalApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'residentPortalApi',
  tagTypes: ['ResidentPortal'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})
