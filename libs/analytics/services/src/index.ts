import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

export const dataApiURL = '/api/a4rc/api/rsa-data-api/graphql/analytics'

export const dataApi = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: dataApiURL
  }),
  reducerPath: 'analytics-data-api',
  tagTypes: ['Monitoring'],
  endpoints: () => ({ })
})
