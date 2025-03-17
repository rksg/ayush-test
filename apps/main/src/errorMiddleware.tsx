import { Middleware, isRejectedWithValue } from '@reduxjs/toolkit'
import { FetchBaseQueryMeta }              from '@reduxjs/toolkit/query'
import _                                   from 'lodash'
import { FormattedMessage, IntlShape }     from 'react-intl'

import { ActionModalType, ErrorDetailsProps, showActionModal } from '@acx-ui/components'
import {
  getIntl,
  setUpIntl,
  IntlSetUpError,
  isShowApiError,
  isShowImprovedErrorSuggestion,
  isIgnoreErrorModal,
  userLogout,
  CatchErrorResponse,
  formatGraphQLErrors,
  errorMessage,
  ErrorMessageType,
  isGraphQLError,
  hasGraphQLErrorCode,
  Meta,
  CatchErrorDetails
} from '@acx-ui/utils'

import type { GraphQLResponse } from 'graphql-request/dist/types'

type QueryMeta = {
  response?: Response
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
  const path = (queryMeta?.response) ? queryMeta.response.url :
    (typeof action.payload !== 'object') ? undefined :
      ('type' in action.payload) ? action.payload['type'] : undefined
  const request = queryMeta?.request
  const response = queryMeta?.response as GraphQLResponse

  let errorMsg = {} as ErrorMessageType
  let type: ActionModalType = 'error'
  let errors: ErrorDetailsProps
    | CatchErrorResponse['data']
    | string
    | undefined

  if (isGraphQLError(action.type, response)) {
    errors = formatGraphQLErrors({ ...response!, errors: _.get(response, 'errors')! })
  } else if (typeof action.payload === 'string') {
    errors = action.payload
  } else if (typeof action.payload === 'object') {
    if('data' in action.payload) {
      const { data } = action.payload
      errors = data?.error
        ? { ...data, errors: [data.error] as CatchErrorDetails[] }
        : data
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
    case 502:
      errorMsg = errorMessage.BAD_GATEWAY
      errors = ''
      break
    case 503:
      errorMsg = errorMessage.SERVICE_UNAVAILABLE
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

  if(errors && isShowImprovedErrorSuggestion(errors)) {
    const errorObj = errors as { errors: CatchErrorDetails[] }
    const description =
      errorObj.errors?.[0].suggestion || errorObj.errors?.[0].reason || ''
    content = <span>{description}</span>
  }

  return {
    title: $t(errorMsg?.title),
    content,
    path,
    errorCode: status as number,
    type,
    errors: errors as ErrorDetailsProps,
    callback
  }
}

export const showErrorModal = (details: {
  title: string,
  content: JSX.Element,
  type: ActionModalType,
  errorCode?: number,
  errors?: ErrorDetailsProps,
  path?: string,
  callback?: () => void
}) => {
  const { title, content, type, errors,
    errorCode, callback, path } = details
  if (title && !isModalShown) {
    isModalShown = true
    showActionModal({
      type,
      title,
      content,
      ...(type === 'error' && { customContent: {
        action: 'SHOW_ERRORS',
        errorDetails: errors,
        path,
        errorCode
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
  return ignoreEndpointList.includes(endpoint) ||
    isIgnoreErrorModal(request) ||
    hasGraphQLErrorCode('RDA-413', action?.meta as Meta)
}

export const errorMiddleware: Middleware = () => next => action => {
  const typedAction = action as unknown as {
    type: string,
    meta?: { baseQueryMeta?: FetchBaseQueryMeta },
    payload: { meta?: QueryMeta, data?: ErrorDetailsProps }
  }
  const { meta, payload } = typedAction
  if (payload && typeof payload === 'object' && meta && !meta.baseQueryMeta) {
    // baseQuery (for retry API)
    meta.baseQueryMeta = payload.meta
    delete payload.meta
  }
  if (isRejectedWithValue(action)) {
    const details = getErrorContent(typedAction)
    if (!shouldIgnoreErrorModal(typedAction)) {
      showErrorModal(details)
    }
  }
  return next(action)
}
