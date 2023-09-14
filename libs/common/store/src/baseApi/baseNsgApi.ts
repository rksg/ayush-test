import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseNsgApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'nsgApi',
  tagTypes: ['Networksegmentation', 'WebAuthNSG'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
