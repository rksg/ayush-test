import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseApApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'apApi',
  tagTypes: ['Ap', 'ApGroup', 'ExternalAntenna'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})
