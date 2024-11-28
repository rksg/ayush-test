import { Middleware, isAction } from '@reduxjs/toolkit'

import { showExpiredSessionModal } from '@acx-ui/analytics/components'

export const errorMiddleware: Middleware = () => next => action => {
  if (isAction(action)) {
    // @ts-ignore
    if (action.meta?.baseQueryMeta?.response?.status === 401) {
      showExpiredSessionModal()
    } else {
      return next(action)
    }
  }
  return next(action)
}
