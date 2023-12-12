import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseNetworkApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'networkApi',
  tagTypes: ['Network', 'Venue'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
