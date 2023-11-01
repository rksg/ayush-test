import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseClientApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'clientApi',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Client', 'Guest', 'HistoricalClient'],
  endpoints: () => ({ })
})
