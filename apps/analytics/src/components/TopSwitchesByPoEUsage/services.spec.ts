import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { AnalyticsFilter }     from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'
import { DateRange }           from '@acx-ui/utils'

import { topSwitchesByPoEUsageResponse } from './__tests__/fixtures'
import { api }                           from './services'

describe('topSwitchesByPoEUsageApi', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataApi.middleware])
  })

  const props = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    filter: {},
    range: DateRange.last24Hours
  } as AnalyticsFilter

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      data: topSwitchesByPoEUsageResponse
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topSwitchesByPoEUsage.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(
      topSwitchesByPoEUsageResponse.network.hierarchyNode.topNSwitchesByPoEUsage
    )
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topSwitchesByPoEUsage.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
