import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseRuckusAssistantApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'ruckusAssistantApi',
  tagTypes: ['RuckusAssistant'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
