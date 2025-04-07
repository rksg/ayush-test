import _ from 'lodash'

import { defaultNetworkPath }               from '@acx-ui/analytics/utils'
import { dataApiURL, store }                from '@acx-ui/store'
import { mockGraphqlQuery }                 from '@acx-ui/test-utils'
import type { PathFilter, DashboardFilter } from '@acx-ui/utils'
import { DateRange }                        from '@acx-ui/utils'

import { expectedFactsResult }          from './__tests__/fixtures'
import { expectedAvailableFactsResult } from './__tests__/fixtures'
import { getFactsData }                 from './facts'
import { api }                          from './services'

const pathFilter: PathFilter & { requestedList: string[]; weekRange: boolean } = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  path: defaultNetworkPath,
  requestedList: [],
  weekRange: false
}
const dashboardFilter: DashboardFilter & { requestedList: string[]; weekRange: boolean } = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {},
  requestedList: [],
  weekRange: false
}

describe('customFacts', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data with PathFilter', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: expectedFactsResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.customFacts.initiate(pathFilter)
    )
    const expected = getFactsData(expectedFactsResult.network.hierarchyNode.facts)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expected)
    expect(error).toBe(undefined)
  })
  it('should return correct data with DashboardFilter', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: expectedFactsResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.customFacts.initiate(dashboardFilter)
    )
    const expected = getFactsData(expectedFactsResult.network.hierarchyNode.facts)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expected)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.customFacts.initiate(pathFilter)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})

describe('availableFacts', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data with PathFilter', async () => {
    mockGraphqlQuery(dataApiURL, 'AvailableFacts', {
      data: expectedAvailableFactsResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.customAvailableFacts.initiate(pathFilter)
    )
    const expected = _.chunk(expectedAvailableFactsResult.network.hierarchyNode.availableFacts, 1)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expected)
    expect(error).toBe(undefined)
  })
  it('should return correct data with DashboardFilter', async () => {
    mockGraphqlQuery(dataApiURL, 'AvailableFacts', {
      data: expectedAvailableFactsResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.customAvailableFacts.initiate(dashboardFilter)
    )
    const expected = _.chunk(expectedAvailableFactsResult.network.hierarchyNode.availableFacts, 1)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expected)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'AvailableFacts', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.customAvailableFacts.initiate(pathFilter)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
