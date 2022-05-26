import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

import { dataApiURL } from '@acx-ui/analytics/utils'

export const dataApi = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: dataApiURL
  }),
  reducerPath: 'analytics-data-api',
  tagTypes: ['Monitoring'],
  endpoints: () => ({ })
})
