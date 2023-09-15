import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseRWGApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'rwgApi',
  tagTypes: ['RWG'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})
