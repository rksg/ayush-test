import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseLicenseApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'licenseApi',
  tagTypes: ['License'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
