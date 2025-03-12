import { intentAIUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }   from '@acx-ui/test-utils'

import { mockedIntentCRRMStatusTrail } from '../../AIDrivenRRM/__tests__/fixtures'

import { api } from './service'

describe('intent status trail', () => {
  const { statusTrail } = mockedIntentCRRMStatusTrail
  it('handle API response', async () => {
    const result = {
      total: statusTrail.length,
      data: statusTrail.slice(10)
    }
    mockGraphqlQuery(intentAIUrl, 'IntentStatusTrail', {
      data: { intent: { statusTrail: result } }
    })

    const response = await store.dispatch(
      api.endpoints.intentStatusTrail.initiate({
        root: 'root', sliceId: 'sliceId', code: 'code'
      })
    )
    expect(response.status).toBe('fulfilled')
    expect(response.error).toBeUndefined()
    expect(response.data).toStrictEqual(result)
  })
  it('handle legacy API response', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentStatusTrail', {
      data: { intent: { statusTrail } }
    })

    const response = await store.dispatch(
      api.endpoints.intentStatusTrail.initiate({
        root: 'root', sliceId: 'sliceId', code: 'code'
      })
    )
    expect(response.status).toBe('fulfilled')
    expect(response.error).toBeUndefined()
    expect(response.data).toStrictEqual({ total: statusTrail.length, data: statusTrail })
  })
})
