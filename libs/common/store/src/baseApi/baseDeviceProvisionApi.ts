import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseDeviceProvisionApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'deviceProvisionApi',
  tagTypes: ['deviceProvision'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
