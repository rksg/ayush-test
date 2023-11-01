import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEdgeDhcpApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'edgeDhcpApi',
  tagTypes: ['EdgeDhcp'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
