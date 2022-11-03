import { configureStore } from '@reduxjs/toolkit'

import { AnalyticsFilter }  from '@acx-ui/analytics/utils'
import { mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }        from '@acx-ui/utils'

import { dataApi, dataApiURL } from './dataApi'
import { healthApi }           from './healthApi'

describe('Services for health kpis', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataApi.middleware])
  })
  const props : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours
  }
  describe('Timeseries', () => {
    const expectedResult = {
      timeSeries: {
        data: [[10, 10]],
        time: ['2022-01-01T00:00:00+08:00']
      }
    }
    afterEach(() => {
      store.dispatch(healthApi.util.resetApiState())
    })
    it('should return correct data for kpi without threshold', async () => {
      mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
        data: expectedResult
      })
      const { status, data, error } = await store.dispatch(
        healthApi.endpoints.kpiTimeseries.initiate({
          ...props,
          kpi: 'connectionSuccess'
        })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult.timeSeries)
      expect(error).toBe(undefined)
    })
    it('should return correct data for kpi with threshold', async () => {
      mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
        data: expectedResult
      })
      const { status, data, error } = await store.dispatch(
        healthApi.endpoints.kpiTimeseries.initiate({
          ...props,
          kpi: 'timeToConnect',
          threshold: '2000'
        })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult.timeSeries)
      expect(error).toBe(undefined)
    })
  })
})
