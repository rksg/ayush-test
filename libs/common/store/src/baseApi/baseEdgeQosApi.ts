import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEdgeQosApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'edgeQosApi',
  tagTypes: ['EdgeQos'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})