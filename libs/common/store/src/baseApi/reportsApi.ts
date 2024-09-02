import { get } from '@acx-ui/config'

import { createApi, fetchBaseQuery } from './baseQuery'

export const REPORT_BASE_RELATIVE_URL = get('IS_MLISA_SA')
  ? '/analytics/explorer' :'/api/a4rc/explorer'

export const reportsApi = createApi({
  baseQuery: fetchBaseQuery({
    mode: 'cors'
  }),
  reducerPath: 'reportsApi',
  refetchOnMountOrArgChange: true,
  tagTypes: ['REPORTS', 'DATA_STUDIO'],
  endpoints: () => ({ })
})
