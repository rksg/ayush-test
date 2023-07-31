import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'apApi',
  tagTypes: ['Ap', 'ApRfNeighbors'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})
