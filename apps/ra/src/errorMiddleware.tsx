import { Middleware } from '@reduxjs/toolkit'

import { showExpiredSessionModal } from '@acx-ui/analytics/components'

import type { AnyAction } from '@reduxjs/toolkit'

export const errorMiddleware: Middleware = () => (next: CallableFunction) =>
  (action: AnyAction) => {
    if (action.meta?.baseQueryMeta?.response?.status === 401) {
      showExpiredSessionModal()
    } else {
      return next(action)
    }
  }
