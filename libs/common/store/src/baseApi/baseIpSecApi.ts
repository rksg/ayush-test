import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseIpSecApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'ipSecApi',
  tagTypes: ['IpSec'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})