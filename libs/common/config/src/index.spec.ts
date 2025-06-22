import { rest } from 'msw'

import { mockServer } from '@acx-ui/test-utils'

describe('common config', () => {
  const env = { GOOGLE_MAPS: 'some-key' }

  let originalLocation: Location
  let originalFetch: typeof global.fetch

  beforeAll(() => {
    originalLocation = window.location
    originalFetch = global.fetch

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'initial' }
    })
  })

  afterAll(() => {
    window.location = originalLocation as string & Location
    global.fetch = originalFetch
  })

  beforeEach(() => {
    jest.resetModules()
    mockServer.resetHandlers()
    window.location.href = 'initial'
    global.fetch = originalFetch
    mockServer.use(
      rest.get(`${document.baseURI}globalValues.json`, (_, res, ctx) => res(ctx.json(env)))
    )
  })

  it('can be initialized and is able to get value of key', async () => {
    const config = require('.')
    await config.initialize()
    expect(config.get('GOOGLE_MAPS_KEY')).toEqual(env.GOOGLE_MAPS)
  })

  it('sends authorization header if jwt token is present', async () => {
    sessionStorage.setItem('jwt', 'testToken')
    mockServer.resetHandlers()
    mockServer.use(
      rest.get(`${document.baseURI}globalValues.json`, (req, res, ctx) => {
        expect(req.headers.get('Authorization')).toEqual('Bearer testToken')
        return res(ctx.json(env))
      })
    )
    const config = require('.')
    config.initialize()
  })

  it('throws error on initialize if response is not 200', async () => {
    mockServer.resetHandlers()
    mockServer.use(
      rest.get(`${document.baseURI}globalValues.json`, (_, res, ctx) => res(ctx.status(401)))
    )
    const config = require('.')
    await expect(config.initialize()).rejects.toBeInstanceOf(config.CommonConfigGetError)
  })

  it('throws error on get if config is not initialized', () => {
    const config = require('.')
    expect(() => config.get('GOOGLE_MAPS_KEY')).toThrow('Config not initialized')
  })

  it('handles mlisa-sa flag on get', () => {
    const config = require('.')
    const originalEnv = process.env
    process.env.NX_IS_MLISA_SA = 'true'
    expect(config.get('IS_MLISA_SA')).toBe('true')
    expect(config.get('IS_MLISA_SA')).toBeTruthy()
    delete process.env.NX_IS_MLISA_SA
    expect(config.get('IS_MLISA_SA')).toBe('')
    expect(config.get('IS_MLISA_SA')).toBeFalsy()
    process.env = originalEnv
  })

  it('redirects if the fetch response explicitly sets redirected and url', async () => {
    const redirectUrl = 'http://manual-redirect-test.com/new/path'
    sessionStorage.clear()

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
        redirected: true,
        url: redirectUrl
      } as Response)
    )

    const config = require('.')
    await config.initialize()

    expect(global.fetch).toHaveBeenCalledWith(
      `${document.baseURI}globalValues.json`,
      expect.any(Object)
    )

    expect(window.location.href).toBe(redirectUrl)
  })
})
