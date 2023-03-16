import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseDhcpApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'dhcpApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
