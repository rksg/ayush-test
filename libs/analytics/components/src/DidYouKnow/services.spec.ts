import { defaultNetworkPath }               from '@acx-ui/analytics/utils'
import { dataApiURL, store }                from '@acx-ui/store'
import { mockGraphqlQuery }                 from '@acx-ui/test-utils'
import type { PathFilter, DashboardFilter } from '@acx-ui/utils'
import { DateRange }                        from '@acx-ui/utils'

import { expectedResult } from './__tests__/fixtures'
import { api }            from './services'

describe('factsApi', () => {
  const pathFilter: PathFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    path: defaultNetworkPath
  }
  const dashboardFilter: DashboardFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data with PathFilter', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.facts.initiate(pathFilter)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode.facts)
    expect(error).toBe(undefined)
  })
  it('should return correct data with DashboardFilter', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.facts.initiate(dashboardFilter)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode.facts)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.facts.initiate(pathFilter)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
