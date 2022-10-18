import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { AnalyticsFilter }     from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'
import { DateRange }           from '@acx-ui/utils'

import { timeseriesApi, histogramApi, getThresholdsApi } from './services'

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
      store.dispatch(timeseriesApi.util.resetApiState())
    })
    it('should return correct data for kpi without threshold', async () => {
      mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
        data: expectedResult
      })
      const { status, data, error } = await store.dispatch(
        timeseriesApi.endpoints.kpiTimeseries.initiate({
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
        timeseriesApi.endpoints.kpiTimeseries.initiate({
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
  describe('Histogram', () => {
    const expectedResult = {
      histogram: {
        data: [10, 10]
      }
    }
    afterEach(() => {
      store.dispatch(histogramApi.util.resetApiState())
    })
    it('should return correct data for kpi', async () => {
      mockGraphqlQuery(dataApiURL, 'histogramKPI', {
        data: expectedResult
      })
      const { status, data, error } = await store.dispatch(
        histogramApi.endpoints.kpiHistogram.initiate({
          ...props,
          kpi: 'clientThroughput'
        })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult.histogram)
      expect(error).toBe(undefined)
    })
  })
  describe('Get Thresholds', () => {
    afterEach(() => {
      store.dispatch(getThresholdsApi.util.resetApiState())
    })
    it('should return correct data', async () => {
      const expectedResult = {
        timeToConnectThreshold: {
          value: 1000
        },
        clientThroughputThreshold: {
          value: 5000
        }
      }
      mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
        data: expectedResult
      })
      const { status, data, error } = await store.dispatch(
        getThresholdsApi.endpoints.getKpiThresholds.initiate(props)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult)
      expect(error).toBe(undefined)
    })
    it('should return correct data for no result', async () => {
      const expectedResult = {
        timeToConnectThreshold: {
          value: null
        },
        clientThroughputThreshold: {
          value: null
        }
      }
      mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
        data: expectedResult
      })
      const { status, data, error } = await store.dispatch(
        getThresholdsApi.endpoints.getKpiThresholds.initiate(props)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult)
      expect(error).toBe(undefined)
    })
    it('should return error', async () => {
      mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        getThresholdsApi.endpoints.getKpiThresholds.initiate(props)
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })
})
