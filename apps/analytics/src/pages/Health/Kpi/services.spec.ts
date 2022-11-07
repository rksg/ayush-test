import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { AnalyticsFilter }     from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'
import { DateRange }           from '@acx-ui/utils'

import { api } from './services'

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
  describe('Histogram', () => {
    const expectedResult = {
      histogram: {
        data: [10, 10]
      }
    }
    afterEach(() => {
      store.dispatch(api.util.resetApiState())
    })
    it('should return correct data for kpi', async () => {
      mockGraphqlQuery(dataApiURL, 'histogramKPI', {
        data: expectedResult
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.kpiHistogram.initiate({
          ...props,
          kpi: 'clientThroughput'
        })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult.histogram)
      expect(error).toBe(undefined)
    })
  })
})
