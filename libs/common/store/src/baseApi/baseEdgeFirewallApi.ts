import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEdgeFirewallApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'edgeFirewallApi',
  tagTypes: ['EdgeFirewall'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})