import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

// for TypeError: Only absolute URLs are supported
export const dataApiURL = (process.env['NODE_ENV'] === 'production'
  ?'https://devalto.ruckuswireless.com'
  :'http://localhost:3000')
  +'/api/a4rc/api/rsa-data-api/graphql/analytics'

// GraphQL queries are place in the context of their respective route/widget,
// please refer to them in source folder under /apps/analytics/src
export const dataApi = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: dataApiURL
  }),
  reducerPath: 'analytics-data-api',
  tagTypes: ['Monitoring'],
  endpoints: () => ({ })
})
