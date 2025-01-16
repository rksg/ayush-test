import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit'
import { FetchBaseQueryMeta }              from '@reduxjs/toolkit/query'

import { showErrorModal, showExpiredSessionModal }                  from '@acx-ui/analytics/components'
import { errorMessage, hasGraphQLErrorCode, isGraphQLAction, Meta } from '@acx-ui/utils'

const shouldIgnoreErrorModal = (meta?: Meta) => {
  return hasGraphQLErrorCode('RDA-413', meta as Meta)
}

export const errorMiddleware: Middleware = () => next => unknownAction => {
  const action = unknownAction as unknown as {
    meta?: { baseQueryMeta?: FetchBaseQueryMeta }
  }
  const status = action.meta?.baseQueryMeta?.response?.status!
  if (status === 401) {
    showExpiredSessionModal()
    return
  }
  if (isRejectedWithValue(action) && !shouldIgnoreErrorModal(action.meta as Meta)) {
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
