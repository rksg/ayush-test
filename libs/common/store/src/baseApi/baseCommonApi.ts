import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseCommonApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'commonApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
