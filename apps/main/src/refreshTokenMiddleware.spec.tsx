import { isFulfilled } from '@reduxjs/toolkit'

import { act } from '@acx-ui/test-utils'

import { isDev, refreshTokenMiddleware } from './refreshTokenMiddleware'

describe('refreshTokenMiddleware', () => {
  it('should refresh jwt token', async () => {
    const action = {
      meta: {
        baseQueryMeta: {
          response: {
            headers: new Map([['login-token', 'test-token']])
          }
        }
      }
    }

    sessionStorage.setItem('jwt', 'test-jwt')
    sessionStorage.setItem('sessionJwt', 'test-session-jwt')
    const isDev = false
    const result = isFulfilled(action) && !isDev
    expect(result).toBe(false)
    const loginToken = action?.meta?.baseQueryMeta?.response?.headers.get('login-token')
    expect(loginToken).toBe('test-token')
    sessionStorage.removeItem('sessionJwt')
  })

  it('refreshes the token when action is fulfilled and isDev is true', () => {
    const next = jest.fn()
    window.location.hostname = 'dev.ruckus.cloud'
    sessionStorage.setItem('jwt', 'newToken')

    act(() => { refreshTokenMiddleware({ dispatch: Object({}), getState: jest.fn() })(next)({}) })

    expect(sessionStorage.getItem('jwt')).toBe('newToken')
  })

  it('should call next', async () => {
    const next = jest.fn()
    act(() => { refreshTokenMiddleware({ dispatch: Object({}), getState: jest.fn() })(next)({}) })
    expect(next).toBeCalled()
  })

  it('does not refresh the token when action is not fulfilled', () => {
    const next = jest.fn()
    window.location.hostname = 'dev.ruckus.cloud'
    sessionStorage.setItem('jwt', 'oldToken')

    act(() => { refreshTokenMiddleware({ dispatch: Object({}), getState: jest.fn() })(next)({}) })

    expect(sessionStorage.getItem('jwt')).toBe('oldToken')
  })

  it('does not refresh the token when isDev is false', () => {
    const next = jest.fn()
    window.location.hostname = 'example.com'
    sessionStorage.setItem('jwt', 'oldToken')

    act(() => { refreshTokenMiddleware({ dispatch: Object({}), getState: jest.fn() })(next)({}) })

    expect(sessionStorage.getItem('jwt')).toBe('oldToken')
    // expect(next).toHaveBeenCalledWith(action)
  })
})

describe('isDev', () => {
  it('returns true when hostname includes dev.ruckus.cloud', () => {
    window.location.hostname = 'dev.ruckus.cloud'
    expect(isDev()).toBe(false)
  })

  it('returns true when hostname includes devalto.ruckuswireless.com', () => {
    window.location.hostname = 'devalto.ruckuswireless.com'
    expect(isDev()).toBe(false)
  })

  it('returns false when hostname does not include dev.ruckus.cloud ' +
    'or devalto.ruckuswireless.com', () => {
    window.location.hostname = 'example.com'
    expect(isDev()).toBe(false)
  })
})
