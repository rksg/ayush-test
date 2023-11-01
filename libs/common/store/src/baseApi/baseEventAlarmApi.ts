import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEventAlarmApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'eventAlarmApi',
  tagTypes: ['Alarms'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
