import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { get } from '@acx-ui/config'
export const REPORT_BASE_RELATIVE_URL = get('IS_MLISA_SA')
  ? '/analytics/explorer' :'/api/a4rc/explorer'

export const reportsApi = createApi({
  baseQuery: fetchBaseQuery({
    mode: 'cors'
  }),
  reducerPath: 'reportsApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})