import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseTunnelProfileApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'tunnelProfileApi',
  tagTypes: ['TunnelProfile'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
