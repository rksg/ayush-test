import { intentAIUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }   from '@acx-ui/test-utils'

import { api, Payload } from './services'

describe('IntentAISummary services', () => {
  const mockPayload: Payload = {
    path: [{ type: 'network', name: 'Network' }]
  }

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should return correct data', async () => {
    const expectedResult = {
      highlights: {
        rrm: {
          new: 0,
          active: 0,
          paused: 7,
          verified: 3
        },
        probeflex: {
          new: 0,
          active: 0,
          paused: 3,
          verified: 6
        },
        ops: {
          new: 0,
          active: 0,
          paused: 8,
          verified: 14
        },
        ecoflex: {
          new: 0,
          active: 0,
          paused: 1,
          verified: 1
        }
      }
    }

    mockGraphqlQuery(intentAIUrl, 'IntentAISummary', { data: expectedResult })

    const { status, data, error } = await store.dispatch(
      api.endpoints.intentAISummary.initiate(mockPayload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.highlights)
    expect(error).toBe(undefined)
  })

  it('should return error', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentAISummary', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.intentAISummary.initiate({} as Payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
