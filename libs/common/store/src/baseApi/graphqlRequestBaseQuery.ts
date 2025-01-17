// NOTE:
// Taken from https://github.com/reduxjs/redux-toolkit/blob/9964cddd92cf188a9302dbff0fb21c8e898f12e4/packages/rtk-query-graphql-request-base-query/src/index.ts
// Main objective was to expose headers from response to `meta`
/* eslint-disable */
import  { print } from 'graphql' // delta from source
import { isPlainObject } from '@reduxjs/toolkit'
import { pendingQueries } from '../cancelMiddleware'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { DocumentNode } from 'graphql'
import { GraphQLClient, ClientError, RequestOptions } from 'graphql-request'
import type {
  ErrorResponse,
  GraphqlRequestBaseQueryArgs,
  PrepareHeaders,
  RequestHeaders
} from '@rtk-query/graphql-request-base-query/dist/GraphqlBaseQueryTypes' // delta from source

type Meta = Partial<Pick<ClientError, 'request' | 'response'>> // delta from source
type Response = Exclude<Meta['response'], undefined> // delta from source

export const graphqlRequestBaseQuery = <E = ErrorResponse>(
  options: GraphqlRequestBaseQueryArgs<E>,
): BaseQueryFn<
  { document: string | DocumentNode; variables?: any },
  unknown,
  E,
  Meta, // delta from source
  Meta // delta from source
> => {
  const client =
    'client' in options ? options.client : new GraphQLClient(options.url)
  const requestHeaders: RequestHeaders =
    'requestHeaders' in options ? options.requestHeaders : {}

  return async (
    { document, variables },
    { getState, endpoint, forced, type, signal, extra, queryCacheKey, abort }
  ) => {
    pendingQueries.set(queryCacheKey, abort)
    try {
      const prepareHeaders: PrepareHeaders =
        options.prepareHeaders ?? ((x) => x)
      const headers = new Headers(stripUndefined(requestHeaders))

      const preparedHeaders = await prepareHeaders(headers, {
        getState,
        endpoint,
        forced,
        type,
        extra,
      })

      // delta from source
      const req = await client.rawRequest({
        query: typeof document === 'string' ? document : print(document),
        variables,
        signal: signal as unknown as RequestOptions['signal'],
        requestHeaders: preparedHeaders
      })

      // delta from source
      const response: Response  = {
        status: req.status,
        headers: req.headers as Response['headers']
      } as Response

      return {
        data: req.data, // delta from source
        meta: { response }, // delta from source
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const { name, message, stack, request, response } = error

        const customErrors =
          options.customErrors ?? (() => ({ name, message, stack }))

        const customizedErrors = customErrors(error) as E

        return { error: customizedErrors, meta: { request, response } }
      }
      throw error
    }
  }
}

function stripUndefined(obj: any) {
  if (!isPlainObject(obj)) {
    return obj
  }
  const copy: Record<string, any> = { ...obj }
  for (const [k, v] of Object.entries(copy)) {
    if (typeof v === 'undefined') delete copy[k]
  }
  return copy
}
