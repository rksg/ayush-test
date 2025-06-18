import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { api, Payload } from './services'

describe('WifiClient services', () => {
  afterEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  const mockResponse = {
    network: {
      hierarchyNode: {
        nodes: [
          {
            manufacturer: [
              { name: 'Apple', value: 10 },
              { name: 'Samsung', value: 5 }
            ],
            deviceType: [
              { name: 'Laptop', value: 10 },
              { name: 'Phone', value: 5 }
            ]
          }
        ]
      }
    }
  }
  const payload: Payload = {
    path: [{ type: 'network', name: 'test-network' }],
    start: '2025-05-31T00:00:00+00:00',
    end: '2025-06-01T00:00:00+00:00',
    n: 5
  }

  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockResponse })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topNWifiClient.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toEqual(mockResponse.network.hierarchyNode)
    expect(error).toBeUndefined()
  })

  it('should handle when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: { network: { hierarchyNode: { nodes: [] } } }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topNWifiClient.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toEqual({ nodes: [] })
    expect(error).toBeUndefined()
  })
})
