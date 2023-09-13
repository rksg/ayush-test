import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseMspApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'mspApi',
  tagTypes: ['Msp'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
