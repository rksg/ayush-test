import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseTimelineApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'timelineApi',
  tagTypes: ['Activity', 'Event', 'AdminLog'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
