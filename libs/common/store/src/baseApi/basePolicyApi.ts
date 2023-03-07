import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const basePolicyApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'policyApi',
  tagTypes: ['Venue', 'Policy', 'MacRegistrationPool', 'MacRegistration', 'ClientIsolation'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
