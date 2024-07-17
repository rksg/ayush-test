import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEdgeSdLanApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'edgeSdLanApi',
  tagTypes: ['EdgeSdLan', 'EdgeSdLanP2', 'EdgeMvSdLan'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})