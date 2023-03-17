import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseEdgeApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'edgeApi',
  tagTypes: ['Edge'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
