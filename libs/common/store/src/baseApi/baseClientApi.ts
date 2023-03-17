import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseClientApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'clientApi',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Client', 'Guest', 'HistoricalClient'],
  endpoints: () => ({ })
})
