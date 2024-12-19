import React from 'react'

import { Middleware, isRejectedWithValue } from '@reduxjs/toolkit'
import { FormattedMessage, IntlShape }     from 'react-intl'

import { ActionModalType, ErrorDetailsProps, showActionModal } from '@acx-ui/components'
import {
  getIntl,
  setUpIntl,
  IntlSetUpError,
  isShowApiError,
  isIgnoreErrorModal,
  userLogout,
  CatchErrorResponse,
  formatGraphQLErrors,
  errorMessage,
  ErrorMessageType
} from '@acx-ui/utils'

import type { GraphQLResponse } from 'graphql-request/dist/types'

type QueryMeta = {
  response?: Response | GraphQLResponse
  request: Request
}
export type ErrorAction = {
  type: string,
  meta?: {
    baseQueryMeta?: QueryMeta,
    arg?: {
      endpointName: string
    }
  }
} & ({
  payload: ({
    // fetchBaseQuery
    data?: ErrorDetailsProps | CatchErrorResponse['data']
    originalStatus?: number
    status?: number
  } | {
    // GraphQL
    message: string
    name: string
    stack: string
  } | {
    // FETCH_ERROR
    error: string
    status: string
  } | string | number)
})

let isModalShown = false
// TODO: workaround for skipping general error dialog
const ignoreEndpointList = [
  'clientInfo',
  'clientPcap',
  'clientConnectionQualities'
]

const isIntDevMode =
  window.location.hostname.includes('int.ruckus.cloud') &&
  window.location.search.includes('devMode=true')

const isDevModeOn = window.location.hostname === 'localhost'

export const getErrorContent = (action: ErrorAction) => {
  // IntlSetUpError can be thrown by bootstrap.tsx when getting
  // user's preferred language, before intl is initialized
  let intl: IntlShape
  try {
    intl = getIntl()
  } catch (error) {
    if (!(error instanceof IntlSetUpError)) throw error
    setUpIntl({ locale: 'en-US' })
    intl = getIntl()
  }
  const { $t } = intl
  const queryMeta = action.meta?.baseQueryMeta
  const status = (queryMeta?.response) ? queryMeta.response.status :
    (typeof action.payload !== 'object') ? undefined :
      ('originalStatus' in action.payload) ? action.payload.originalStatus :
        ('status' in action.payload) ? action.payload.status : undefined
  const request = queryMeta?.request
  const response = queryMeta?.response

  let errorMsg = {} as ErrorMessageType
  let type: ActionModalType = 'error'
  let errors: ErrorDetailsProps
    | CatchErrorResponse['data']
    | string
    | undefined

  if (action.type?.includes('data-api') && response && 'errors' in response) {
    errors = formatGraphQLErrors({ ...response, errors: response.errors! })
  } else if (typeof action.payload === 'string') {
    errors = action.payload
  } else if (typeof action.payload === 'object') {
    if('data' in action.payload) {
      errors = action.payload.data
    } else if ('error' in action.payload) {
      errors = action.payload.error
    } else if ('message' in action.payload) {
      errors = action.payload.message
    }
  }
  let callback = undefined

  switch (status) {
    case 400:
      errorMsg = errorMessage.BAD_REQUEST
      break
    case 401:
      errorMsg = errorMessage.SESSION_EXPIRED
      type = 'info'
      if(!isDevModeOn && !isIntDevMode) {
        callback = userLogout
      }
      break
    case 408: // request timeout
      errorMsg = errorMessage.OPERATION_FAILED
      break
    case 423:
      errorMsg = errorMessage.REQUEST_IN_PROGRESS
      errors = ''
      break
    case 429:
      errorMsg = errorMessage.TOO_MANY_REQUESTS
      errors = ''
      break
    case 504: // no connection [development mode]
    case 0:   // no connection
    case 'FETCH_ERROR' as unknown as number: // no connection
      errorMsg = errorMessage.CHECK_YOUR_CONNECTION
      type = 'info'
      if (!isIntDevMode) {
        callback = () => window.location.reload()
      }
      break
    case 422:
      const countryInvalid // TODO: check error format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        = (errors as any)?.error?.errors?.find((e:any) => e.code === 'WIFI-10114')
      if (countryInvalid) {
        errorMsg = errorMessage.COUNTRY_INVALID
      } else {
        errorMsg = errorMessage.VALIDATION_ERROR
      }
      break
    default:
      // TODO: shouldIgnoreErrorCode
      errorMsg = errorMessage.SERVER_ERROR
      break
  }
  let content = <FormattedMessage {...errorMsg?.content} values={{ br: () => <br /> }} />
  if (errors && isShowApiError(request)) {
    if (typeof errors === 'string') {
      content = <p>{errors}</p>
    }
    else if ('errors' in errors) { // CatchErrorDetails
      const errorsMessageList = errors.errors.map(err=>err.message)
      content = <>{errorsMessageList.map(msg=><p key={msg}>{msg}</p>)}</>
    }
  }

  return {
    title: $t(errorMsg?.title),
    content,
    type,
    errors: errors as ErrorDetailsProps,
    callback
  }
}

export const showErrorModal = (details: {
  title: string,
  content: JSX.Element,
  type: ActionModalType,
  errors?: ErrorDetailsProps,
  callback?: () => void
}) => {
  const { title, content, type, errors, callback } = details
  if (title && !isModalShown) {
    isModalShown = true
    showActionModal({
      type,
      title,
      content,
      ...(type === 'error' && { customContent: {
        action: 'SHOW_ERRORS',
        errorDetails: errors
      } }),
      onOk: () => {
        callback?.()
        isModalShown = false
      }
    })
  }
}

const shouldIgnoreErrorModal = (action?: ErrorAction) => {
  const endpoint = action?.meta?.arg?.endpointName || ''
  const request = action?.meta?.baseQueryMeta?.request
  return ignoreEndpointList.includes(endpoint) || isIgnoreErrorModal(request)
}

export const errorMiddleware: Middleware = () => (next) => (action: ErrorAction) => {
  if (action?.payload && typeof action.payload === 'object' && 'meta' in action.payload
    && action.meta && !action.meta?.baseQueryMeta) {
    // baseQuery (for retry API)
    const payload = action.payload as { meta?: QueryMeta }
    action.meta.baseQueryMeta = payload.meta
    delete payload.meta
  }

  if (isRejectedWithValue(action)) {
    const details = getErrorContent(action)
    if (!shouldIgnoreErrorModal(action)) {
      showErrorModal(details)
    }
  }
  return next(action)
}
