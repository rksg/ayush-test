import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

import { getJwtHeaders } from '@acx-ui/utils'

// eslint-disable-next-line max-len
export const networkHealthApiURL = `${window.location.origin}/api/a4rc/api/rsa-mlisa-service-guard/graphql`

const baseQuery = graphqlRequestBaseQuery({
  url: networkHealthApiURL,
  requestHeaders: getJwtHeaders()
})

export type NetworkHealthBaseQuery = typeof baseQuery

// GraphQL queries are place in the context of their respective route/widget,
// please refer to them in source folder under /apps/analytics/src
export const networkHealthApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'analytics-network-health-api',
  refetchOnMountOrArgChange: true,
  tagTypes: ['NetworkHealth'],
  endpoints: () => ({ })
})
