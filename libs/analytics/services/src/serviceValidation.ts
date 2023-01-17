import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

export const networkhealthURL = `${window.location.origin}/api/a4rc/api/rsa-mlisa-service-guard/graphql`

// GraphQL queries are place in the context of their respective route/widget,
// please refer to them in source folder under /libs/analytics/components/src
export const networkHealthApi = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: networkhealthURL
  }),
  reducerPath: 'networkHealthApi',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Monitoring'],
  endpoints: () => ({ })
})
