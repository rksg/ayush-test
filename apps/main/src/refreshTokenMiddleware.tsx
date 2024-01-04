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

export const isDev = () => {
  return window.location.hostname.includes('dev.ruckus.cloud')
    || window.location.hostname.includes('devalto.ruckuswireless.com')
    || window.location.hostname.includes('localhost')
}

export const refreshTokenMiddleware: Middleware = () => (next) => (action: MiddlewareAction) => {
  // JWT refresh flow support in UI
  // TODO: isDev flag is used for initial testing by QA purpose, will be cleaned up once testing is done by QA
  // TODO: temporary logs below will be cleanup once this is tested by QA & before moving the code to higher envs
  if ((isFulfilled(action)) && isDev()) {
    const jwt = sessionStorage.getItem('jwt') ?? 'null'
    const loginToken = action?.meta?.baseQueryMeta?.response?.headers.get('login-token')
    if (loginToken) {
      // eslint-disable-next-line no-console
      console.log('%c[%s] Refreshing login token:::: [%s]',
        'color: green',
        new Date().toLocaleString(),
        action?.meta?.baseQueryMeta?.response?.headers.get('login-token'))
      sessionStorage.setItem('oldJwt', jwt) // temporary parameter, will clean up once testing is done
      sessionStorage.setItem('jwt', loginToken)
      updateJwtCache(loginToken)
    }
  }
  return next(action)
}
