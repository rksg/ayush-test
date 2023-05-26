import { rest } from 'msw'

import { mockServer } from '@acx-ui/test-utils'

describe('common-config', () => {
  beforeEach(() => jest.resetModules())

  it('initialize and be able to get value of key', async () => {
    jest.resetModules()
    const config = require('./index')
    const env = {
      GOOGLE_MAPS_KEY: 'GOOGLE_MAPS_KEY'
    }
    mockServer.use(rest.get('/env.json', (_, r, c) => r(c.json(env))))

    expect(() => config.get('GOOGLE_MAPS_KEY')).toThrow('Config not initialized')

    await config.initialize()
    expect(config.get('GOOGLE_MAPS_KEY')).toEqual(env.GOOGLE_MAPS_KEY)
  })

  it('initialize for RA', async () => {
    jest.resetModules()
    const config = require('./index')
    const env = {
      MLISA_RBAC_URL: 'MOCK_RBAC_URL'
    }
    mockServer.use(rest.get('/env-ra.json', (_, r, c) => r(c.json(env))))

    expect(() => config.get('MLISA_RBAC_URL')).toThrow('Config not initialized')

    await config.initialize({ isRa: true })
    expect(config.get('MLISA_RBAC_URL')).toEqual(env.MLISA_RBAC_URL)
  })

})

