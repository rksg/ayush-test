import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

import { getJwtHeaders } from '@acx-ui/utils'

export const dataApiRecommendationURL =
  `${window.location.origin}/analytics/api/rsa-data-api/graphql/configRecommendation`

export const dataApiRecommendation = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: dataApiRecommendationURL,
    prepareHeaders: (headers) => {
      Object.entries(getJwtHeaders())
        .forEach(([header, value]) => headers.set(header, value))
      return headers
    }
  }),
  reducerPath: 'recommendation-data-api',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Monitoring'],
  endpoints: () => ({ })
})