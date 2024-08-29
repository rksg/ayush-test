import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import _                         from 'lodash'

import { getTenantId, reConnectSocket, updateJwtCache } from '@acx-ui/utils'

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
        retry.fail({
          ...result.error,
          meta: result.meta
        })
      }
    }

    const headers = result?.meta?.response?.headers
    if (headers) {
      const loginToken = headers.get('login-token')
      if (loginToken) {
        sessionStorage.setItem('jwt', loginToken)
        sessionStorage.removeItem('ACX-ap-compatibiliy-note-hidden') // clear ap compatibiliy banner display condition
        updateJwtCache(loginToken)
        const tenantId = getTenantId()

        const url = loginToken ? `/activity?token=${loginToken}&tenantId=${tenantId}`
          : `/activity?tenantId=${tenantId}`
        reConnectSocket(url)
      }
    }

    return result
  },
  {
    maxRetries: 0
  }
)
