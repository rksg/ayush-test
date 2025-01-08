import { QueryReturnValue }                                                 from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { RetryOptions }                                                     from '@reduxjs/toolkit/dist/query/retry'
import { MaybePromise }                                                     from '@reduxjs/toolkit/dist/query/tsHelpers'
import { BaseQueryApi, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'

import { RequestPayload }             from '@acx-ui/types'
import { ApiInfo, createHttpRequest } from '@acx-ui/utils'

export type QueryFn<ResultType, QueryArg = never, BaseQueryResultType = ResultType> = (
  { params, payload, enableRbac }: RequestPayload<QueryArg>,
  _queryApi: BaseQueryApi,
  _extraOptions: RetryOptions,
  // eslint-disable-next-line max-len
  fetchWithBQ: (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<BaseQueryResultType, FetchBaseQueryError, FetchBaseQueryMeta>>
) => MaybePromise<QueryReturnValue<ResultType, FetchBaseQueryError, FetchBaseQueryMeta>>

export function commonQueryFn (apiInfo: ApiInfo, rbacApiInfo: ApiInfo = apiInfo) {
  return (queryArgs: RequestPayload) => {
    const { params, payload, enableRbac = false } = queryArgs
    const resolvedApiInfo = (enableRbac && rbacApiInfo) ? rbacApiInfo : apiInfo
    // eslint-disable-next-line max-len
    const resolvedPayload = resolvedApiInfo?.defaultHeaders?.['Content-Type'] ? JSON.stringify(payload) : payload
    const allowedReqBody = resolvedPayload && (resolvedApiInfo.method !== 'get')

    return {
      ...createHttpRequest(resolvedApiInfo, params),
      ...(allowedReqBody ? { body: resolvedPayload } : {})
    }
  }
}
