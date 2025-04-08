import { createApi } from '@reduxjs/toolkit/query/react'

import { get }           from '@acx-ui/config'
import { getJwtHeaders } from '@acx-ui/utils'

import { graphqlRequestBaseQuery } from './baseQuery'

const getApiUrls = () => {
  const r1ApiURL = `${window.location.origin}/api/a4rc/api/rsa-data-api/graphql/analytics`
  const r1ApiSearchURL = `${window.location.origin}/api/a4rc/api/rsa-data-api/graphql/search`
  const raApiURL = `${window.location.origin}/analytics/api/rsa-data-api/graphql/analytics`
  const raApiSearchURL = `${window.location.origin}/analytics/api/rsa-data-api/graphql/search`

  const isRa = get('IS_MLISA_SA')
  return {
    dataApiURL: isRa ? raApiURL : r1ApiURL,
    dataApiSearchURL: isRa ? raApiSearchURL : r1ApiSearchURL,
    intentAIUrl: isRa
      ? `${window.location.origin}/analytics/api/rsa-data-api/graphql/intentAI`
      : `${window.location.origin}/api/a4rc/api/rsa-data-api/graphql/intentAI`
  }
}

export const { dataApiURL, dataApiSearchURL, intentAIUrl } = getApiUrls()

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
  tagTypes: ['Monitoring', 'Dashboard', 'Health'],
  endpoints: () => ({ })
})

export const intentAIApi = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: intentAIUrl,
    prepareHeaders: (headers) => {
      Object.entries(getJwtHeaders())
        .forEach(([header, value]) => headers.set(header, value))
      return headers
    }
  }),
  reducerPath: 'analytics-data-api-intentai',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Intent'],
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
