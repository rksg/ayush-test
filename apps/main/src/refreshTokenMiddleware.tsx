import { Middleware, isFulfilled } from '@reduxjs/toolkit'

import { ErrorDetailsProps }  from '@acx-ui/components'
import { CatchErrorResponse } from '@acx-ui/rc/utils'

type QueryMeta = {
  response?: Response,
  request: Request
}
export type MiddlewareAction = {
  type: string,
  meta?: {
    baseQueryMeta?: QueryMeta,
    arg?: {
      endpointName: string
    }
  }
} & ({
  payload: ({
    // fetchBaseQuery
    data?: ErrorDetailsProps | CatchErrorResponse['data']
    originalStatus?: number
    status?: number
  } | {
    // GraphQL
    message: string
    name: string
    stack: string
  } | {
    // FETCH_ERROR
    error: string
    status: string
  } | string | number)
})

export const isDev = () => {
  return window.location.hostname.includes('dev.ruckus.cloud')
    || window.location.hostname.includes('devalto.ruckuswireless.com')
}

export const refreshTokenMiddleware: Middleware = () => (next) => (action: MiddlewareAction) => {
  // const isDevModeOn = window.location.hostname === 'localhost'

  // JWT refresh flow support in UI
  // isDev flag is used for initial testing by QA purpose, will be cleaned up once testing is done by QA
  // temporary logs below will be cleanup once this is tested by QA & before moving the code to higher envs
  if ((isFulfilled(action)) && isDev) {
    const jwt = sessionStorage.getItem('jwt') ?? 'null'
    const loginToken = action?.meta?.baseQueryMeta?.response?.headers.get('login-token')
    if (loginToken) {
      // eslint-disable-next-line no-console
      console.log('login-token: ',
        action?.meta?.baseQueryMeta?.response?.headers.get('login-token'))
    }
    sessionStorage.setItem('sessionJwt', jwt) // temporary parameter, will clean up once testing is done
    sessionStorage.setItem('jwt', loginToken ?? jwt)
  }
  return next(action)
}
