import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseConnectionMeteringApi = createApi({
  baseQuery: fetchBaseQuery(),
  tagTypes: ['ConnectionMetering'],
  reducerPath: 'connectionMeteringApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})