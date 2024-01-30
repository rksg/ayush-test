import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseConfigTemplateApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'configTemplateApi',
  tagTypes: ['ConfigTemplate', 'AAATemplate', 'NetworkTemplate', 'VenueTemplate'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
