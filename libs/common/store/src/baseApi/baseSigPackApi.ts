import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseSigPackApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'sigPackApi',
  tagTypes: [
    'SigPack'
  ],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
