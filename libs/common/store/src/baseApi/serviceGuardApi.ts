import { createApi } from '@reduxjs/toolkit/query/react'

import { get }           from '@acx-ui/config'
import { getJwtHeaders } from '@acx-ui/utils'

import { graphqlRequestBaseQuery } from './baseQuery'

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
  baseQuery,
  reducerPath: 'analytics-network-health-api',
  refetchOnMountOrArgChange: true,
  tagTypes: ['ServiceGuard'],
  endpoints: () => ({ })
})
