import { rest } from 'msw'

import { mockServer } from '@acx-ui/test-utils'

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

describe('process.env', () => {
  const env = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env }
  })

  afterEach(() => {
    process.env = env
  })

  it('should handle mlisa-sa flag', () => {
    process.env.NX_IS_MLISA_SA = 'true'
    const config = require('./index')
    expect(config.get('IS_MLISA_SA')).toBeTruthy()
    process.env.NX_IS_MLISA_SA = undefined
    expect(config.get('IS_MLISA_SA')).toBeUndefined()
  })
})

