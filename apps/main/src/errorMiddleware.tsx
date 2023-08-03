import React from 'react'

import { Middleware, isRejectedWithValue }            from '@reduxjs/toolkit'
import { FormattedMessage, defineMessage, IntlShape } from 'react-intl'

import { ActionModalType, ErrorDetailsProps, showActionModal } from '@acx-ui/components'
import { getIntl, setUpIntl, IntlSetUpError }                  from '@acx-ui/utils'

export type ErrorAction = {
  type: string,
  meta: {
    baseQueryMeta: {
      response: {
        status: number
      }
    },
    arg?: {
      endpointName: string
    }
  },
  payload: {
    data?: ErrorDetailsProps
    originalStatus?: number
    status?: number
  }
}

interface ErrorMessageType {
  title: { defaultMessage: string },
  content: { defaultMessage: string }
}

let isModalShown = false
// TODO: workaround for skipping general error dialog
const ignoreEndpointList = [
  'addAp', 'updateAp', 'inviteDelegation', 'addRecipient', 'updateRecipient', 'getDnsServers',
  'addEdge', 'clientInfo', 'getClientDetails', 'getPropertyConfigs', 'getDhcpByEdgeId',
  'convertNonVARToMSP', 'createNetworkSegmentationGroup', 'updateNetworkSegmentationGroup',
  'uploadZdConfig', 'importPersonas', 'detectApNeighbors'
]

export const errorMessage = {
  SERVER_ERROR: {
    title: defineMessage({ defaultMessage: 'Server Error' }),
    content: defineMessage({
      defaultMessage: 'An internal error has occurred. Please contact support.'
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
  CHECK_YOUR_CONNECTION: {
    title: defineMessage({ defaultMessage: 'Check Your Connection' }),
    content: defineMessage({
      defaultMessage: 'RUCKUS One needs you to be online,<br></br>you appear to be offline.'
    })
  },
  COUNTRY_INVALID: {
    title: defineMessage({ defaultMessage: 'Error' }),
    content: defineMessage({
      defaultMessage: `The service is currently not supported in the country which you entered.
      <br></br>Please make sure that you entered the correct address.`
    })
  }
}

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
  const status = action.meta.baseQueryMeta?.response?.status
   ?? action.payload?.originalStatus
   ?? action.payload?.status

  let errorMsg = {} as ErrorMessageType
  let type: ActionModalType = 'error'
  let errors = action.payload.data
  let needLogout = false
  let callback = undefined

  switch (status) {
    case 400:
      if (errors?.error === 'API-KEY not present') {
        needLogout = true
      }
      errorMsg = errorMessage.SERVER_ERROR
      break
    case 401:
    case 403:
      errorMsg = errorMessage.SESSION_EXPIRED
      type = 'info'
      needLogout = true
      break
    case 408: // request timeout
      errorMsg = errorMessage.OPERATION_FAILED
      break
    case 423:
      errorMsg = errorMessage.REQUEST_IN_PROGRESS
      errors = '' as ErrorDetailsProps
      break
    case 504: // no connection [development mode]
    case 0:   // no connection
    case 'FETCH_ERROR' as unknown as number: // no connection
      errorMsg = errorMessage.CHECK_YOUR_CONNECTION
      type = 'info'
      callback = () => window.location.reload()
      break
    case 422:
      const countryInvalid // TODO: check error format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        = (errors as any)?.error?.errors?.find((e:any) => e.code === 'WIFI-10114')
      if (countryInvalid) {
        errorMsg = errorMessage.COUNTRY_INVALID
      } else {
        errorMsg = errorMessage.SERVER_ERROR
      }
      break
    default:
      // TODO: shouldIgnoreErrorCode
      errorMsg = errorMessage.SERVER_ERROR
      break
  }

  return {
    title: $t(errorMsg?.title),
    content: <FormattedMessage
      {...errorMsg?.content}
      values={{ br: () => <br /> }}
    />,
    type,
    errors,
    callback,
    needLogout
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

export const errorMiddleware: Middleware = () => (next) => (action: ErrorAction) => {
  const isDevModeOn = window.location.hostname === 'localhost'
  const endpoint = action?.meta?.arg?.endpointName || ''
  if (isRejectedWithValue(action)) {
    const { needLogout, ...details } = getErrorContent(action)
    if (!ignoreEndpointList.includes(endpoint)) {
      showErrorModal(details)
    }
    if (needLogout && !isDevModeOn) {
      const token = sessionStorage.getItem('jwt')?? null
      sessionStorage.removeItem('jwt')
      window.location.href = token? `/logout?token=${token}` : '/logout'
    }
  }
  return next(action)
}
