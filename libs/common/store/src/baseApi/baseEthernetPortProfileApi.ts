import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseEthernetPortProfileApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'ethernetPortProfileApi',
  tagTypes: ['EthernetPortProfile'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})