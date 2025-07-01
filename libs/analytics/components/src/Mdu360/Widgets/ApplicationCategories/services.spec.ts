import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { api, Payload, TopNApplicationCategoriesResponse } from './services'

const mockPayload: Payload = {
  path: [{ type: 'network', name: 'Network' }],
  start: '2024-03-23T07:23:00+05:30',
  end: '2025-05-24T07:23:00+05:30',
  n: 10
}

const mockResponse: TopNApplicationCategoriesResponse = {
  network: {
    hierarchyNode: {
      nodes: [{
        clientCount: [
          { name: 'Application Service', value: 6 },
          { name: 'Unknown', value: 6 },
          { name: 'Web', value: 6 },
          { name: 'Instant Messaging', value: 4 },
          { name: 'Network Management', value: 4 },
          { name: 'Network Service', value: 4 },
          { name: 'Webmail', value: 2 },
          { name: 'Education', value: 20 },
          { name: 'Medicine', value: 5 },
          { name: 'Transportation', value: 12 }
        ],
        dataUsage: [
          { name: 'Application Service', value: 24605875 },
          { name: 'Unknown', value: 735023714 },
          { name: 'Web', value: 25794416527 },
          { name: 'Instant Messaging', value: 833554 },
          { name: 'Network Management', value: 6574 },
          { name: 'Network Service', value: 540313 },
          { name: 'Webmail', value: 1010014 },
          { name: 'Education', value: 310014112 },
          { name: 'Medicine', value: 10100140 },
          { name: 'Transportation', value: 4400000 }
        ]
      }]
    }
  }
}

describe('ApplicationCategories services', () => {
  describe('topNApplicationCategories', () => {
    it('should return top 10 application categories correctly', async () => {
      mockGraphqlQuery(dataApiURL, 'Network', { data: mockResponse })
      const { status, data, error } = await store.dispatch(
        api.endpoints.topNApplicationCategories.initiate(mockPayload)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(mockResponse.network.hierarchyNode.nodes[0])
      expect(error).toBe(undefined)
    })

    it('should handle error', async () => {
      mockGraphqlQuery(dataApiURL, 'Network', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.topNApplicationCategories.initiate({} as Payload)
      )
      expect(status).toBe('rejected')
      expect(data).toBeUndefined()
      expect(error).not.toBeUndefined()
    })
  })
})