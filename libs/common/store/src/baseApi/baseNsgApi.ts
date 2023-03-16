import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseNsgApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'nsgApi',
  tagTypes: ['Networksegmentation', 'WebAuthNSG'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
