import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEdgeMdnsProxyApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'edgeMdnsProxyApi',
  tagTypes: ['EdgeMdnsProxy'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})