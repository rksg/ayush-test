import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { AnalyticsFilter }     from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'
import { DateRange }           from '@acx-ui/utils'

import { connectionSuccessFixture } from './__tests__/fixtures'
import { api }                      from './services'

describe('KpiWidget', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataApi.middleware])
  })

  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours
  }
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = {
      timeSeries: {
        data: connectionSuccessFixture
      }
    }
    mockGraphqlQuery(dataApiURL, 'KpiWidget', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.kpiTimeseries.initiate({
        name: 'connectionSuccess',
        filters
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.timeSeries.data)
    expect(error).toBe(undefined)
  })

  it('should return correct data for no result', async () => {
    const expectedResult = {
      timeSeries: {
        data: [null,null]
      }
    }
    mockGraphqlQuery(dataApiURL, 'KpiWidget', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.kpiTimeseries.initiate({
        name: 'clientThroughput',
        filters
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.timeSeries.data)
    expect(error).toBe(undefined)
  })

  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'KpiWidget', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.kpiTimeseries.initiate({
        name: 'timeToConnect',
        threshold: 5000,
        filters
      })
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})