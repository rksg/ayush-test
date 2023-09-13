import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseRWGApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'rwgApi',
  tagTypes: ['RWG'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})
