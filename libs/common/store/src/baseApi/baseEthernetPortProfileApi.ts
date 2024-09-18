import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseEthernetPortProfileApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'ethernetPortProfileApi',
  tagTypes: ['EthernetPortProfile'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})