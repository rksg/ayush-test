import { isFulfilled } from '@reduxjs/toolkit'

import { act } from '@acx-ui/test-utils'

import { refreshTokenMiddleware } from './refreshTokenMiddleware'

describe('refreshTokenMiddleware', () => {
  const { location } = window
  const mockReload = jest.fn()
  beforeEach(() => Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: { reload: mockReload }
  }))
  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true, enumerable: true, value: location
    })
    mockReload.mockReset()
  })
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
    const result = isFulfilled(action)
    expect(result).toBe(false)
    const loginToken = action?.meta?.baseQueryMeta?.response?.headers.get('login-token')
    expect(loginToken).toBe('test-token')
    sessionStorage.removeItem('sessionJwt')
  })

  it('refreshes the token when action is fulfilled is true', () => {
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
})
