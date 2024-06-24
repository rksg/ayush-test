import { QueryReturnValue }                                   from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { MaybePromise }                                       from '@reduxjs/toolkit/dist/query/tsHelpers'
import { FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'

import { ApiVersionEnum, GetApiVersionAcceptHeader, GetApiVersionHeader } from '@acx-ui/rc/utils'
import { RequestPayload }                                                 from '@acx-ui/types'
import { ApiInfo, createHttpRequest }                                     from '@acx-ui/utils'

export function commonQueryFn (
  apiInfo: ApiInfo,
  // eslint-disable-next-line max-len
  restInfo?: { rbacApiInfo: ApiInfo, rbacApiVersionKey: ApiVersionEnum }
) {
  return (queryArgs: RequestPayload) => {
    return createFetchArgsBasedOnRbac({
      apiInfo,
      ...(restInfo ?? {}),
      queryArgs
    })
  }
}

// eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
function getApiVersionHeaderBaseOnPayload (payload: any | undefined, apiVersionKey: ApiVersionEnum | undefined) {
  return (payload ? GetApiVersionHeader : GetApiVersionAcceptHeader)(apiVersionKey)
}

interface RbacFetchProps<PayloadType = unknown> {
  apiInfo: ApiInfo
  apiVersionKey?: ApiVersionEnum
  rbacApiInfo?: ApiInfo
  rbacApiVersionKey?: ApiVersionEnum
  queryArgs: RequestPayload<PayloadType>
}
export function createFetchArgsBasedOnRbac (props: RbacFetchProps) {
  const { apiInfo, apiVersionKey, rbacApiInfo = apiInfo, rbacApiVersionKey, queryArgs } = props
  const { params, payload, enableRbac = false } = queryArgs
  const resolvedApiInfo = enableRbac ? rbacApiInfo : apiInfo
  // eslint-disable-next-line max-len
  const apiVersionHeaders = getApiVersionHeaderBaseOnPayload(payload, enableRbac ? rbacApiVersionKey : apiVersionKey)
  // eslint-disable-next-line max-len
  const resolvedPayload = apiVersionHeaders && apiVersionHeaders.hasOwnProperty('Content-Type') && payload ? JSON.stringify(payload) : payload

  return {
    ...createHttpRequest(resolvedApiInfo, params, apiVersionHeaders),
    ...(resolvedPayload ? { body: resolvedPayload } : {})
  }
}

export interface ExecuteQueryProps<PayloadType = unknown> extends RbacFetchProps<PayloadType> {
  rbacApiInfo: ApiInfo
  rbacApiVersionKey: ApiVersionEnum
  // eslint-disable-next-line max-len
  fetchWithBQ: (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>
}
