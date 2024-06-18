import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { getJwtHeaders } from '@acx-ui/utils'

export const smartZoneURL = `${window.location.origin}/analytics/api/rsa-mlisa-smartzone/v1`

export const smartZoneApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: smartZoneURL,
    prepareHeaders: (headers) => {
      Object.entries(getJwtHeaders())
        .forEach(([header, value]) => headers.set(header, value))
      return headers
    }
  }),
  reducerPath: 'smartZoneApi',
  refetchOnMountOrArgChange: true,
  tagTypes: ['SmartZone'],
  endpoints: () => ({ })
})
