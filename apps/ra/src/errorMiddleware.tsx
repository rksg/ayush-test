import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit'
import { FetchBaseQueryMeta }              from '@reduxjs/toolkit/query'

import { showErrorModal, showExpiredSessionModal } from '@acx-ui/analytics/components'
import { errorMessage }                            from '@acx-ui/utils'

type Meta = { baseQueryMeta?: { response?: { errors?: [{ extensions?: { code?: string } }] } } }

const shouldIgnoreErrorModal = (meta?: Meta) => {
  return meta?.baseQueryMeta?.response?.errors?.[0].extensions?.code === 'RDA-413'
}

export const errorMiddleware: Middleware = () => next => unknownAction => {
  const action = unknownAction as unknown as {
    meta?: { baseQueryMeta?: FetchBaseQueryMeta }
  }
  const status = action.meta?.baseQueryMeta?.response?.status
  if (status === 401) {
    showExpiredSessionModal()
    return
  }
  if (isRejectedWithValue(action) && !shouldIgnoreErrorModal(action.meta as Meta)) {
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
