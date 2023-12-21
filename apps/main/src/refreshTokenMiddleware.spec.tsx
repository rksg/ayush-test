import { isFulfilled } from '@reduxjs/toolkit'

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

})
