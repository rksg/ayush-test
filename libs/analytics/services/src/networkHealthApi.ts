import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

import { getJwtToken } from '@acx-ui/utils'

// eslint-disable-next-line max-len
export const networkHealthApiURL = `${window.location.origin}/api/a4rc/api/rsa-mlisa-service-guard/graphql`

// GraphQL queries are place in the context of their respective route/widget,
// please refer to them in source folder under /apps/analytics/src
export const networkHealthApi = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: networkHealthApiURL,
    ...(getJwtToken() ? { requestHeaders: { Authorization: `Bearer ${getJwtToken()}` } } : {})
  }),
  reducerPath: 'analytics-network-health-api',
  refetchOnMountOrArgChange: true,
  tagTypes: ['NetworkHealth'],
  endpoints: () => ({ })
})
