import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'
import { DateRange }         from '@acx-ui/utils'

import * as fixtures from './__tests__/fixtures'
import { api }       from './services'

describe('networkFilter', () => {
  const props = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    querySwitch: true,
    filter: {}
  }

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: fixtures.networkFilterResult
      }
    }
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkFilter.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode.children)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkFilter.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})

describe('recentNetworkFilter', () => {
  const props = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: fixtures.recentNetworkFilterResult
      }
    }
    mockGraphqlQuery(dataApiURL, 'RecentNetworkHierarchy', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.recentNetworkFilter.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode.children)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'RecentNetworkHierarchy', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.recentNetworkFilter.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
