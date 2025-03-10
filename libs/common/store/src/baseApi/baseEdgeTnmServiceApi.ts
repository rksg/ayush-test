import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEdgeTnmServiceApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'edgeTnmServiceApi',
  tagTypes: ['EdgeTnmService', 'EdgeNokiaOlt'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})