import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

export const dataApiURL = `${window.location.origin}/api/a4rc/api/rsa-data-api/graphql/analytics`

// GraphQL queries are place in the context of their respective route/widget,
// please refer to them in source folder under /apps/analytics/src
export const dataApi = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: dataApiURL
  }),
  reducerPath: 'analytics-data-api',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Monitoring'],
  endpoints: () => ({ })
})
