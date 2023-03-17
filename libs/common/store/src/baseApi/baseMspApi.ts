import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseMspApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'mspApi',
  tagTypes: ['Msp'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
