import { dataApiURL, store }    from '@acx-ui/store'
import { mockGraphqlQuery }     from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { topPortsResponse } from './__tests__/fixtures'
import { api }              from './services'

describe('useTopPortsQuery', () => {
  const props = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    filter: {
    }
  } as AnalyticsFilter & { by: 'traffic' | 'error' }

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'TopNPorts', {
      data: topPortsResponse
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topPorts.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(
      topPortsResponse.network.hierarchyNode.topNPorts
    )
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'TopNPorts', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topPorts.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
