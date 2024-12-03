import { Middleware }         from '@reduxjs/toolkit'
import { FetchBaseQueryMeta } from '@reduxjs/toolkit/query'

import { showExpiredSessionModal } from '@acx-ui/analytics/components'

export const errorMiddleware: Middleware = () => next => action => {
  const { meta } = action as unknown as { meta?: { baseQueryMeta?: FetchBaseQueryMeta } }
  if (meta?.baseQueryMeta?.response?.status === 401) {
    showExpiredSessionModal()
  } else {
    return next(action)
  }
}
