import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseIotApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'iotApi',
  tagTypes: ['IotController'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
