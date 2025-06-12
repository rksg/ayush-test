import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { api, Payload } from './services'

describe('TopApplications services', () => {
  afterEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  const mockResponse = {
    network: {
      hierarchyNode: {
        topNApplicationByClient: [
          {
            applicationTraffic: 75000,
            clientCount: 300,
            name: 'WhatsApp'
          },
          {
            applicationTraffic: 12345,
            clientCount: 150,
            name: 'Facebook'
          },
          {
            applicationTraffic: 23456,
            clientCount: 30,
            name: 'Twitter'
          },
          {
            applicationTraffic: 3456789,
            clientCount: 100,
            name: 'YouTube'
          },
          {
            applicationTraffic: 1250000,
            clientCount: 200,
            name: 'Netflix'
          },
          {
            applicationTraffic: 121212,
            clientCount: 60,
            name: 'Instagram'
          },
          {
            applicationTraffic: 2323233,
            clientCount: 70,
            name: 'Snapchat'
          },
          {
            applicationTraffic: 343434343,
            clientCount: 800,
            name: 'TikTok'
          }
        ]
      }
    }
  }
  const payload: Payload = {
    path: [{ type: 'network', name: 'test-network' }],
    start: '2025-05-31T00:00:00+00:00',
    end: '2025-06-01T00:00:00+00:00',
    n: 10
  }

  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockResponse })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topNApplication.initiate(payload)
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
      api.endpoints.topNApplication.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toEqual({ nodes: [] })
    expect(error).toBeUndefined()
  })
})
