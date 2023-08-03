import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'apApi',
  tagTypes: ['Ap', 'ApRfNeighbors', 'ApLldpNeighbors'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})
