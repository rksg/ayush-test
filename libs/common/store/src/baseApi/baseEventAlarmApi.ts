import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseEventAlarmApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'eventAlarmApi',
  tagTypes: ['Alarms'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
