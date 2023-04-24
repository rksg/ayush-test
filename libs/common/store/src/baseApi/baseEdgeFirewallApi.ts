import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseEdgeFirewallApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'edgeFirewallApi',
  tagTypes: ['EdgeFirewall'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})