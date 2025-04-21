import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseRuckusAiChatApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'ruckusAiChatApi',
  tagTypes: ['Chat', 'Canvas', 'Widget'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
