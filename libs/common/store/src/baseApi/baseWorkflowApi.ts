import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseWorkflowApi = createApi({
  baseQuery: baseQuery,
  tagTypes: ['Workflow', 'Action', 'Step'],
  reducerPath: 'workflowApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
