import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import _                         from 'lodash'

import type { FetchArgs } from '@reduxjs/toolkit/dist/query/fetchBaseQuery'

export const baseQuery = retry(
  async (args: string | FetchArgs, api, extraOptions) => {
    const result = await fetchBaseQuery()(
      args,
      api,
      extraOptions
    )

    if (result.error) {
      const status = result.error?.status
      const errorCode = _.get(result.error, 'originalStatus')
      if(status !== 'FETCH_ERROR' && errorCode !== 504 && errorCode !== 0){
        retry.fail(result.error)
      }
    }

    return result
  },
  {
    maxRetries: 0
  }
)