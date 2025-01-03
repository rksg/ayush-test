import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit'

import { showErrorModal, showExpiredSessionModal } from '@acx-ui/analytics/components'
import { errorMessage, isGraphQLAction }           from '@acx-ui/utils'

import type { AnyAction } from '@reduxjs/toolkit'

const shouldIgnoreErrorModal = (action?: AnyAction) => {
  return action?.meta?.baseQueryMeta?.response?.errors?.[0].extensions?.code === 'RDA-413'
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
      } else if (status === 503) {
        showErrorModal(errorMessage.SERVICE_UNAVAILABLE)
      } else if (status >= 500 && status < 600) {
        showErrorModal(errorMessage.SERVER_ERROR, action)
      } else if (isGraphQLAction(action)) {
        showErrorModal(errorMessage.SERVER_ERROR, action)
      }
    }
    return next(action)
  }
