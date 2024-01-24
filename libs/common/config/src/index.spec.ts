import { rest } from 'msw'

import { mockServer } from '@acx-ui/test-utils'

import { getJwtToken, userAuthFailedLogout } from '.'

it('initialize and be able to get value of key for R1', async () => {
  jest.resetModules()
  const config = require('./index')
  const env = {
    GOOGLE_MAPS: 'GOOGLE_MAPS_KEY'
  }
  mockServer.use(rest.get('/globalValues.json', (_, r, c) => r(c.json(env))))

  expect(() => config.get('GOOGLE_MAPS_KEY')).toThrow('Config not initialized')

  await config.initialize('r1')
  expect(config.get('GOOGLE_MAPS_KEY')).toEqual(env.GOOGLE_MAPS)
})

it('initialize and be able to get value of key for RAI', async () => {
  jest.resetModules()
  const config = require('./index')
  const env = {
    GOOGLE_MAPS: 'GOOGLE_MAPS_KEY'
  }
  mockServer.use(rest.get('/globalValues.json', (_, r, c) => r(c.json(env))))

  expect(() => config.get('GOOGLE_MAPS_KEY')).toThrow('Config not initialized')

  await config.initialize('ra')
  expect(config.get('GOOGLE_MAPS_KEY')).toEqual(env.GOOGLE_MAPS)
})

describe('process.env', () => {
  const { location } = window
  const env = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env }

    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: { href: new URL('https://url/').href }
    })
  })

  afterEach(() => {
    process.env = env
    Object.defineProperty(window, 'location', {
      configurable: true, enumerable: true, value: location
    })
  })

  it('should handle mlisa-sa flag', () => {
    process.env.NX_IS_MLISA_SA = 'true'
    const config = require('./index')
    expect(config.get('IS_MLISA_SA')).toBe('true')
    expect(config.get('IS_MLISA_SA')).toBeTruthy()
    process.env.NX_IS_MLISA_SA = undefined
    expect(config.get('IS_MLISA_SA')).toBe('')
    expect(config.get('IS_MLISA_SA')).toBeFalsy()
  })

  it('should get globalValues.json correctly', async () => {
    jest.resetModules()
    const env = {
      GOOGLE_MAPS: 'GOOGLE_MAPS_KEY'
    }
    const requestConfig = { headers: { Authorization: `Bearer ${getJwtToken()}` } }
    mockServer.use(rest.get('https://url/globalValues.json', (_, r, c) => r(c.json(env))))
    const response = await fetch('/globalValues.json', requestConfig)
    userAuthFailedLogout(response)
    expect(window.location.href).toEqual('https://url/')
  })

  it('should logout without token correctly', async () => {
    jest.resetModules()
    sessionStorage.removeItem('jwt')
    await Promise.resolve()
    const requestConfig = { headers: { Authorization: `Bearer ${getJwtToken()}` } }
    mockServer.use(
      rest.get('https://url/globalValues.json', (_, res, ctx) => {
        return res(ctx.status(401)) // Return a 401 response
      })
    )

    const response = await fetch('https://url/globalValues.json', requestConfig)
    userAuthFailedLogout(response)
    expect(window.location.href).toEqual('/logout')
  })

  it('should logout with token correctly', async () => {
    jest.resetModules()
    sessionStorage.setItem('jwt', 'token')
    await Promise.resolve()
    const requestConfig = { headers: { Authorization: `Bearer ${getJwtToken()}` } }
    mockServer.use(
      rest.get('https://url/globalValues.json', (_, res, ctx) => {
        return res(ctx.status(401)) // Return a 401 response
      })
    )

    const response = await fetch('https://url/globalValues.json', requestConfig)
    userAuthFailedLogout(response)
    expect(window.location.href).toEqual('/logout?token=token')
  })
})

