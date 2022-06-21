import { rest } from 'msw'

import { mockServer } from '@acx-ui/test-utils'

import * as config from './index'

it('initialize and be able to get value of key', async () => {
  const env = {
    GOOGLE_MAPS_KEY: 'GOOGLE_MAPS_KEY'
  }
  mockServer.use(rest.get('/env.json', (_, r, c) => r(c.json(env))))

  expect(() => config.get('GOOGLE_MAPS_KEY')).toThrow('Config not initialized')

  await config.initialize()
  expect(config.get('GOOGLE_MAPS_KEY')).toEqual(env.GOOGLE_MAPS_KEY)
})
