import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseTimelineApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'timelineApi',
  tagTypes: ['Activity', 'Event', 'AdminLog'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
