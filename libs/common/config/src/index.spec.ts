import { rest } from 'msw'

import { mockServer } from '@acx-ui/test-utils'

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
    expect(config.get('IS_MLISA_SA')).toBe('true')
    expect(config.get('IS_MLISA_SA')).toBeTruthy()
    process.env.NX_IS_MLISA_SA = undefined
    expect(config.get('IS_MLISA_SA')).toBe('')
    expect(config.get('IS_MLISA_SA')).toBeFalsy()
  })
})

