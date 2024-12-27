import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit'

import { showErrorModal, showExpiredSessionModal } from '@acx-ui/analytics/components'
import { errorMessage }                            from '@acx-ui/utils'

import type { AnyAction } from '@reduxjs/toolkit'

export const errorMiddleware: Middleware = () => (next: CallableFunction) =>
  (action: AnyAction) => {
    const status = action.meta?.baseQueryMeta?.response?.status
    if (status === 401) {
      showExpiredSessionModal()
      return
    }
    if (isRejectedWithValue(action)) {
      switch (status) {
        case 400:
          showErrorModal(errorMessage.BAD_REQUEST, action)
          break
        case 408:
          showErrorModal(errorMessage.OPERATION_FAILED, action)
          break
        case 422:
          showErrorModal(errorMessage.VALIDATION_ERROR, action)
          break
        case 423:
          showErrorModal(errorMessage.REQUEST_IN_PROGRESS, action)
          break
        case 429:
          showErrorModal(errorMessage.TOO_MANY_REQUESTS)
          break
        case 503:
          showErrorModal(errorMessage.SERVICE_UNAVAILABLE)
          break
        default:
          showErrorModal(errorMessage.SERVER_ERROR, action)
      }
    }
    return next(action)
  }
