import { Middleware, isFulfilled } from '@reduxjs/toolkit'

import { updateJwtCache } from '@acx-ui/utils'

type QueryMeta = {
  response?: Response,
  request: Request
}
export type MiddlewareAction = {
  type: string,
  meta?: {
    baseQueryMeta?: QueryMeta
  }
}

export const refreshTokenMiddleware: Middleware = () => (next) => (action: MiddlewareAction) => {
  // JWT refresh flow support in UI
  if (isFulfilled(action)) {
    const loginToken = action?.meta?.baseQueryMeta?.response?.headers.get('login-token')
    if (loginToken) {
      sessionStorage.setItem('jwt', loginToken)
      sessionStorage.removeItem('ACX-ap-compatibiliy-note-hidden') // clear ap compatibiliy banner display condition
      updateJwtCache(loginToken)
    }
  }
  return next(action)
}
