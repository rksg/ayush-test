import { get }           from '@acx-ui/config'
import { getJwtHeaders } from '@acx-ui/utils'

import { createApi, fetchBaseQuery } from './baseQuery'

const isRa = get('IS_MLISA_SA')

export const rbacApiURL = isRa
  ? `${window.location.origin}/analytics/api/rsa-mlisa-rbac`
  : `${window.location.origin}/api/a4rc/api/rsa-mlisa-rbac`

export const rbacApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: rbacApiURL,
    prepareHeaders: (headers) => {
      Object.entries(getJwtHeaders())
        .forEach(([header, value]) => headers.set(header, value))
      return headers
    }
  }),
  reducerPath: 'rbacApi',
  refetchOnMountOrArgChange: true,
  tagTypes: ['RBAC', 'ApplicationToken'],
  endpoints: () => ({ })
})
