import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseEdgeDhcpApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'edgeDhcpApi',
  tagTypes: ['EdgeDhcp'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
