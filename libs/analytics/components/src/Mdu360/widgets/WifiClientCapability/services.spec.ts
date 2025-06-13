import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { Mdu360Filter } from '../../types'

import { mockedWifiClientCapability } from './__tests__/fixtures'
import { api }                        from './services'

describe('WifiClient services', () => {
  afterEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  const mockResponse = {
    network: {
      hierarchyNode: {
        wifiClientCapability: mockedWifiClientCapability
      }
    }
  }
  const payload: Mdu360Filter = {
    path: [{ type: 'network', name: 'test-network' }],
    start: '2025-05-31T00:00:00+00:00',
    end: '2025-06-01T00:00:00+00:00'
  }

  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockResponse })
    const { status, data, error } = await store.dispatch(
      api.endpoints.wifiClientCapability.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toEqual(mockResponse.network.hierarchyNode.wifiClientCapability[0])
    expect(error).toBeUndefined()
  })

  it('should handle when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: { network: { hierarchyNode: { wifiClientCapability: [] } } }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.wifiClientCapability.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toBeUndefined()
    expect(error).toBeUndefined()
  })
})