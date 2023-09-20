import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEdgeApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'edgeApi',
  tagTypes: ['Edge'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
