import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseNetworkApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'networkApi',
  tagTypes: ['Network'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const baseCloudpathApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'cloudpathListApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
