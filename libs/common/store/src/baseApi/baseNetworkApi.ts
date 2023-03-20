import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseNetworkApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'networkApi',
  tagTypes: ['Network', 'Venue'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
