import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseConnectionMeteringApi = createApi({
  baseQuery: baseQuery,
  tagTypes: ['ConnectionMetering'],
  reducerPath: 'connectionMeteringApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})