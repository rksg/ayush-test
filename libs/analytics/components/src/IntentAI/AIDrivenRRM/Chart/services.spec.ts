import { intentAIUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }   from '@acx-ui/test-utils'

import { mockedAPChannelDistribution } from '../__tests__/fixtures'

import { api } from './services'

describe('AP Channel Distribution API', () => {
  it('handle API response', async () => {
    mockGraphqlQuery(intentAIUrl, 'APChannelDistribution', {
      data: { intent: { apChannelDistribution: mockedAPChannelDistribution } }
    })

    const response = await store.dispatch(
      api.endpoints.apChannelDistribution.initiate({
        root: 'root', sliceId: 'sliceId', code: 'code'
      })
    )
    expect(response.status).toBe('fulfilled')
    expect(response.error).toBeUndefined()
    expect(response.data).toStrictEqual(mockedAPChannelDistribution)
  })
})
