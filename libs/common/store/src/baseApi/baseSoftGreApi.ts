import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseSoftGreApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'softGrelApi',
  tagTypes: ['SoftGre'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
