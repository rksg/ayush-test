import { defineMessage } from 'react-intl'

import { get } from '@acx-ui/config'

import { CatchErrorResponse } from './types/catchError'

import type { GraphQLResponse } from 'graphql-request/dist/types'

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
