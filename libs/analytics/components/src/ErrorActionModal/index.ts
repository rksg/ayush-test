import { AnyAction } from '@reduxjs/toolkit'

import { ActionModalType, ErrorDetailsProps, showActionModal } from '@acx-ui/components'
import {
  getIntl,
  setUpIntl,
  IntlSetUpError,
  userLogout,
  ErrorMessageType,
  errorMessage,
  formatGraphQLErrors,
  isGraphQLError
} from '@acx-ui/utils'

let isModalShown = false

function showModal (
  type: ActionModalType,
  errorMsg: ErrorMessageType,
  callback?: () => void,
  errors?: ErrorDetailsProps
) {
  try {
    getIntl()
  } catch (error) {
    if (!(error instanceof IntlSetUpError)) throw error
    setUpIntl({ locale: 'en-US' })
  }
  const { $t } = getIntl()
  if (!isModalShown) {
    isModalShown = true
    showActionModal({
      type: type,
      title: $t(errorMsg.title),
      content: $t(errorMsg.content),
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

export function showExpiredSessionModal () {
  const isDevModeOn = window.location.hostname === 'localhost'
  showModal(
    'info',
    errorMessage.SESSION_EXPIRED,
    () => {
      if (!isDevModeOn) userLogout()
    }
  )
}

export function showErrorModal (errorMessage: ErrorMessageType, action?: AnyAction): void {
  showModal('error', errorMessage, undefined, action && getErrorContent(action))
}

export function getErrorContent (action: AnyAction) : ErrorDetailsProps {
  const queryMeta = action.meta?.baseQueryMeta
  const response = queryMeta?.response
  let errors
  errors = action
  if (isGraphQLError(action.type, response)) {
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
  return errors as ErrorDetailsProps
}
