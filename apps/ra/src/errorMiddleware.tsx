import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit'

import { showErrorModal, showExpiredSessionModal }                     from '@acx-ui/analytics/components'
import { Action, errorMessage, hasSpecificErrorCode, isGraphQLAction } from '@acx-ui/utils'

import type { AnyAction } from '@reduxjs/toolkit'

const shouldIgnoreErrorModal = (action?: AnyAction) => {
  return hasSpecificErrorCode(action as Action)
}

export const errorMiddleware: Middleware = () => (next: CallableFunction) =>
  (action: AnyAction) => {
    const status = action.meta?.baseQueryMeta?.response?.status
    if (status === 401) {
      showExpiredSessionModal()
      return
    }
    if (isRejectedWithValue(action) && !shouldIgnoreErrorModal(action)) {
      if (status === 429) {
        showErrorModal(errorMessage.TOO_MANY_REQUESTS)
      } else if (status >= 500 && status < 600) {
        switch (status) {
          case 502:
            showErrorModal(errorMessage.BAD_GATEWAY)
            break
          case 503:
            showErrorModal(errorMessage.SERVICE_UNAVAILABLE)
            break
          case 504:
            showErrorModal(errorMessage.GATEWAY_TIMEOUT)
            break
          default:
            showErrorModal(errorMessage.SERVER_ERROR, action)
        }
      } else if (isGraphQLAction(action)) {
        showErrorModal(errorMessage.SERVER_ERROR, action)
      }
    }
    return next(action)
  }
