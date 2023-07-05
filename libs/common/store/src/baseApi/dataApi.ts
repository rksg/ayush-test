import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

import { get }           from '@acx-ui/config'
import { getJwtHeaders } from '@acx-ui/utils'

const getApiUrls = () => {
  const r1ApiURL = `${window.location.origin}/api/a4rc/api/rsa-data-api/graphql/analytics`
  const r1ApiSearchURL = `${window.location.origin}/api/a4rc/api/rsa-data-api/graphql/search`
  const raApiURL = `${window.location.origin}/analytics/api/rsa-data-api/graphql/analytics`
  const raApiSearchURL = `${window.location.origin}/analytics/api/rsa-data-api/graphql/search`

  const isRa = get('IS_MLISA_SA')
  return {
    dataApiURL: isRa ? raApiURL : r1ApiURL,
    dataApiSearchURL: isRa ? raApiSearchURL : r1ApiSearchURL,
    recommendationUrl: isRa
      ? `${window.location.origin}/analytics/api/rsa-data-api/graphql/configRecommendation`
      : `${window.location.origin}/api/a4rc/api/rsa-data-api/graphql/configRecommendation`
  }
}

export const { dataApiURL, dataApiSearchURL, recommendationUrl } = getApiUrls()

// GraphQL queries are place in the context of their respective route/widget,
// please refer to them in source folder under /apps/analytics/src
export const dataApi = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: dataApiURL,
    prepareHeaders: (headers) => {
      Object.entries(getJwtHeaders())
        .forEach(([header, value]) => headers.set(header, value))
      return headers
    }
  }),
  reducerPath: 'analytics-data-api',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Monitoring'],
  endpoints: () => ({ })
})

export const recommendationApi = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: recommendationUrl,
    prepareHeaders: (headers) => {
      Object.entries(getJwtHeaders())
        .forEach(([header, value]) => headers.set(header, value))
      return headers
    }
  }),
  reducerPath: 'analytics-data-api-recommendation',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Monitoring'],
  endpoints: () => ({ })
})

export const dataApiSearch = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: dataApiSearchURL,
    prepareHeaders: (headers) => {
      Object.entries(getJwtHeaders())
        .forEach(([header, value]) => headers.set(header, value))
      return headers
    }
  }),
  reducerPath: 'search-data-api',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Monitoring'],
  endpoints: () => ({ })
})