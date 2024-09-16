import {
  createApi,
  fetchBaseQuery as originalFetchBaseQuery,
  retry
} from '@reduxjs/toolkit/query/react'
import _ from 'lodash'

import { reconnectSockets, updateJwtCache } from '@acx-ui/utils'

import {
  graphqlRequestBaseQuery as originalGraphqlRequestBaseQuery
} from './graphqlRequestBaseQuery'

import type { FetchArgs } from '@reduxjs/toolkit/dist/query/fetchBaseQuery'

export { createApi }
export function refreshJWT (headers?: Headers | Record<string, string>) {
  if (!headers) return

  const jwtToken = headers instanceof Headers
    ? headers.get('login-token')
    : headers['login-token']

  if (!jwtToken) return

  sessionStorage.setItem('jwt', jwtToken)
  sessionStorage.removeItem('ACX-ap-compatibiliy-note-hidden')
  updateJwtCache(jwtToken)
  reconnectSockets()
}

export const fetchBaseQuery: typeof originalFetchBaseQuery = (options) => {
  const baseQuery = originalFetchBaseQuery(options)
  const wrapperBaseQuery: typeof baseQuery = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions)
    refreshJWT(result.meta?.response?.headers)
    return result
  }
  return wrapperBaseQuery
}

export const baseQuery = retry(
  async (args: string | FetchArgs, api, extraOptions) => {
    const result = await fetchBaseQuery()(args, api, extraOptions)

    if (result.error) {
      const status = result.error?.status
      const errorCode = _.get(result.error, 'originalStatus')
      if(status !== 'FETCH_ERROR' && errorCode !== 504 && errorCode !== 0){
        retry.fail({
          ...result.error,
          meta: result.meta
        })
      }
    }

    return result
  },
  { maxRetries: 0 }
)

export const graphqlRequestBaseQuery: typeof originalGraphqlRequestBaseQuery = (options) => {
  const baseQuery = originalGraphqlRequestBaseQuery(options)
  const wrapperBaseQuery: typeof baseQuery = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions)

    refreshJWT(result.meta?.response?.headers)

    return result
  }

  return wrapperBaseQuery
}
