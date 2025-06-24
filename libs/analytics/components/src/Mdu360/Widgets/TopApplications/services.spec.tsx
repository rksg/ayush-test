import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { mockTopApplications } from './__tests__/fixtures'
import { api, Payload }        from './services'

describe('TopApplications services', () => {
  afterEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  const payload: Payload = {
    path: [{ type: 'network', name: 'test-network' }],
    start: '2025-05-31T00:00:00+00:00',
    end: '2025-06-01T00:00:00+00:00',
    n: 10
  }

  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockTopApplications })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topNApplications.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toEqual(mockTopApplications.network.hierarchyNode)
    expect(error).toBeUndefined()
  })

  it('should handle when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: { network: { hierarchyNode: { nodes: [] } } }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topNApplications.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toEqual({ nodes: [] })
    expect(error).toBeUndefined()
  })

  it('should handle error', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topNApplications.initiate({} as Payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBeUndefined()
    expect(error).not.toBeUndefined()
  })
})
