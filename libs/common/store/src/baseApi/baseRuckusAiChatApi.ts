import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseRuckusAiChatApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'ruckusAiChatApi',
  tagTypes: ['Canvas', 'Chat', 'Dashboard', 'Widget'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
