import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

import { get }           from '@acx-ui/config'
import { getJwtHeaders } from '@acx-ui/utils'

// eslint-disable-next-line max-len
export const serviceGuardApiURL = get('IS_MLISA_SA')
  ? `${window.location.origin}/analytics/api/rsa-mlisa-service-guard/graphql`
  : `${window.location.origin}/api/a4rc/api/rsa-mlisa-service-guard/graphql`

const baseQuery = graphqlRequestBaseQuery({
  url: serviceGuardApiURL,
  prepareHeaders: (headers) => {
    Object.entries(getJwtHeaders())
      .forEach(([header, value]) => headers.set(header, value))
    return headers
  }
})

export type ServiceGuardBaseQuery = typeof baseQuery

export const serviceGuardApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'analytics-network-health-api',
  refetchOnMountOrArgChange: true,
  tagTypes: ['ServiceGuard'],
  endpoints: () => ({ })
})
