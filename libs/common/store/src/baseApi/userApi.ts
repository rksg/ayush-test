import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const userApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'userApi',
  tagTypes: ['UserProfile', 'Mfa'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
