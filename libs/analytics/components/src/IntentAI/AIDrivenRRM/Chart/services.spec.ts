import { intentAIUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }   from '@acx-ui/test-utils'

import { mockedApChannelDistribution, mockedApPowerDistribution } from '../__tests__/fixtures'

import { api } from './services'

describe('AP Channel Distribution API', () => {
  it('handle API response', async () => {
    mockGraphqlQuery(intentAIUrl, 'ApChannelDistribution', {
      data: { intent: { apChannelDistribution: mockedApChannelDistribution } }
    })

    const response = await store.dispatch(
      api.endpoints.apChannelDistribution.initiate({
        root: 'root', sliceId: 'sliceId', code: 'code'
      })
    )
    expect(response.status).toBe('fulfilled')
    expect(response.error).toBeUndefined()
    expect(response.data).toStrictEqual(mockedApChannelDistribution)
  })
})

describe('AP Power Distribution API', () => {
  it('handle API response', async () => {
    mockGraphqlQuery(intentAIUrl, 'ApPowerDistribution', {
      data: { intent: { apPowerDistribution: mockedApPowerDistribution } }
    })

    const response = await store.dispatch(
      api.endpoints.apPowerDistribution.initiate({
        root: 'root', sliceId: 'sliceId', code: 'code'
      })
    )
    expect(response.status).toBe('fulfilled')
    expect(response.error).toBeUndefined()
    expect(response.data).toStrictEqual(mockedApPowerDistribution)
  })
})
