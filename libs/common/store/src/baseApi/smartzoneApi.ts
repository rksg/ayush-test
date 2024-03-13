import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const smartZoneURL = `${window.location.origin}/analytics/api/rsa-mlisa-smartzone/v1`

export const smartZoneApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: smartZoneURL }),
  reducerPath: 'smartZoneApi',
  refetchOnMountOrArgChange: true,
  tagTypes: ['SMARTZONE'],
  endpoints: () => ({ })
})
