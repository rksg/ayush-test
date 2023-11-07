import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEdgeCentralizedForwardingApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'edgeCentralizedForwardingApi',
  tagTypes: ['EdgeCentralizedForwarding'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})