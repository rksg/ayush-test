import type { Middleware } from '@reduxjs/toolkit'

export const pendingQueries = new Map()

export const cancelMiddleware: Middleware = ({ getState, dispatch }) => next => action => {
  const { type, payload, meta } = action as unknown as {
    type: string,
    meta: { requestStatus: string, arg: { queryCacheKey: string } },
    payload: { queryCacheKey: string }
  }
  // console.log('a', action, pendingQueries.size)
  if (type?.endsWith('/unsubscribeQueryResult')) {
    const { queryCacheKey } = payload
    const abort = pendingQueries.get(queryCacheKey)
    if (abort) {
      const [api] = type.match(/^[^/]+/)!
      const state = getState()[api]
      const query = state.queries[queryCacheKey]
      if (query?.status === 'pending') {
        // console.log('abort', queryCacheKey, state)
        abort()
        dispatch({ type: api + '/queries/removeQueryResult', payload: { queryCacheKey } })
        pendingQueries.delete(queryCacheKey)
      }
    }
  } else if (type?.includes('/executeQuery/')) {
    const { requestStatus, arg: { queryCacheKey } } = meta
    if (requestStatus !== 'pending') {
      pendingQueries.delete(queryCacheKey)
    }
  }
  return next(action)
}
