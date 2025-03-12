import { defineMessage } from 'react-intl'

import { get } from '@acx-ui/config'

import { CatchErrorResponse } from './types/catchError'

import type { AnyAction }       from '@reduxjs/toolkit'
import type { GraphQLResponse } from 'graphql-request/dist/types'

const reducerPaths = ['data-api', 'network-health']

export type Meta =
  { baseQueryMeta?: { response?: { errors?: [{ extensions?: { code?: string } }] } } }

export function isGraphQLAction (action: AnyAction) : boolean {
  const type = action.type
  return !!(type && reducerPaths.find(p => type.includes(p)))
}

export function isGraphQLError (type: string | undefined, response?: object): boolean {
  return !!(type && reducerPaths.find(p => type.includes(p)) && response && 'errors' in response)
}

export function formatGraphQLErrors (
  response: Required<Pick<GraphQLResponse, 'errors'>> & GraphQLResponse
): CatchErrorResponse['data'] {
  return {
    requestId: response.extensions?.requestId,
    errors: response.errors.map(error => ({
      code: error.extensions?.code,
      message: error.message
    }))
  }
}

export const hasGraphQLErrorCode = (code: string, meta?: Meta) => {
  return meta?.baseQueryMeta?.response?.errors?.[0].extensions?.code === code
}

export interface ErrorMessageType {
  title: { defaultMessage: string },
  content: { defaultMessage: string }
}

export const errorMessage = {
  SERVER_ERROR: {
    title: defineMessage({ defaultMessage: 'Server Error' }),
    content: defineMessage({
      defaultMessage: 'An internal error has occurred. Please contact support.'
    })
  },
  BAD_REQUEST: {
    title: defineMessage({ defaultMessage: 'Bad Request' }),
    content: defineMessage({
      defaultMessage: 'Your request resulted in an error. Please contact Support.'
    })
  },
  VALIDATION_ERROR: {
    title: defineMessage({ defaultMessage: 'Validation Error' }),
    content: defineMessage({
      defaultMessage: 'An internal error has occurred. Please contact Support.'
    })
  },
  SESSION_EXPIRED: {
    title: defineMessage({ defaultMessage: 'Session Expired' }),
    content: defineMessage({
      defaultMessage: 'Your session has expired. Please login again.'
    })
  },
  OPERATION_FAILED: {
    title: defineMessage({ defaultMessage: 'Operation Failed' }),
    content: defineMessage({
      defaultMessage: 'The operation failed because of a request time out'
    })
  },
  REQUEST_IN_PROGRESS: {
    title: defineMessage({ defaultMessage: 'Request in Progress' }),
    content: defineMessage({
      defaultMessage: `A configuration request is currently being executed and additional
      requests cannot be performed at this time.<br></br>Try again once the request has completed.`
    })
  },
  TOO_MANY_REQUESTS: {
    title: defineMessage({ defaultMessage: 'Too Many Requests' }),
    content: defineMessage({
      defaultMessage: 'Too many requests. Please try again later.'
    })
  },
  BAD_GATEWAY: {
    title: defineMessage({ defaultMessage: 'Bad Gateway' }),
    content: defineMessage({
      defaultMessage: 'Bad gateway. Please try again later.'
    })
  },
  SERVICE_UNAVAILABLE: {
    title: defineMessage({ defaultMessage: 'Service Unavailable' }),
    content: defineMessage({
      defaultMessage: 'Service unavailable. Please try again later.'
    })
  },
  GATEWAY_TIMEOUT: {
    title: defineMessage({ defaultMessage: 'Gateway Timeout' }),
    content: defineMessage({
      defaultMessage: 'Gateway timeout. Please try again later.'
    })
  },
  CHECK_YOUR_CONNECTION: get('IS_MLISA_SA') ? {
    title: defineMessage({ defaultMessage: 'Check Your Connection' }),
    content: defineMessage({
      defaultMessage: 'RUCKUS AI needs you to be online,<br></br>you appear to be offline.' })
  } : {
    title: defineMessage({ defaultMessage: 'Check Your Connection' }),
    content: defineMessage({
      defaultMessage: 'RUCKUS One needs you to be online,<br></br>you appear to be offline.' })
  },
  COUNTRY_INVALID: {
    title: defineMessage({ defaultMessage: 'Error' }),
    content: defineMessage({
      defaultMessage: `The service is currently not supported in the country which you entered.
      <br></br>Please make sure that you entered the correct address.`
    })
  }
}
