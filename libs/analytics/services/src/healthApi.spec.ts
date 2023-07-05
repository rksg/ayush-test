import { configureStore, SerializedError } from '@reduxjs/toolkit'

import { AnalyticsFilter, pathToFilter }         from '@acx-ui/analytics/utils'
import { dataApi, dataApiURL }                   from '@acx-ui/store'
import { mockGraphqlMutation, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange, NetworkPath }                from '@acx-ui/utils'

import { healthApi } from '.'

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
    range: DateRange.last24Hours,
    filter: {}
  }
  describe('Timeseries', () => {
    const expectedResult = {
      network: {
        timeSeries: {
          data: [[10, 10]],
          time: ['2022-01-01T00:00:00+08:00']
        }
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
      expect(data).toStrictEqual(expectedResult.network.timeSeries)
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
      expect(data).toStrictEqual(expectedResult.network.timeSeries)
      expect(error).toBe(undefined)
    })

    it('should return correct data for fetchThresholdPermission query', async () => {
      const path: NetworkPath = [{ name: 'Network', type: 'network' }]
      const filter = pathToFilter(path)
      const validData = {
        ThresholdMutationAllowed: true
      }
      mockGraphqlQuery(dataApiURL, 'KPI', {
        data: validData
      })
      const { status, data, error } = await store.dispatch(
        healthApi.endpoints.fetchThresholdPermission.initiate({
          filter
        })
      )

      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(validData)
      expect(error).toBeUndefined()
    })

    it('should return error for fetchThresholdPermission query', async () => {
      const path: NetworkPath = [{ name: 'Network', type: 'network' }]
      const filter = pathToFilter(path)
      const invalidData = undefined
      const mockedError = 'unexpected permission fetch error'
      mockGraphqlQuery(dataApiURL, 'KPI', {
        data: invalidData,
        error: mockedError
      })

      const { status, data, error } = await store.dispatch(
        healthApi.endpoints.fetchThresholdPermission.initiate({
          filter
        })
      )

      expect(status).toBe('rejected')
      expect(data).toBeUndefined()
      expect(error?.message).toMatch(mockedError)
    })

    it('should return correct data for saveThreshold mutation', async () => {
      const path: NetworkPath = [{ name: 'Network', type: 'network' }]
      const filter = pathToFilter(path)
      const validData = {
        mutationAllowed: true
      }
      mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
        data: validData
      })
      const response = await store.dispatch(
        healthApi.endpoints.saveThreshold.initiate({
          filter,
          name: 'apCapacity',
          value: 30
        })
      )
      expect(response).toBeDefined()
      expect(response).toMatchObject({ data: validData })
    })

    it('should return error for saveThreshold mutation', async () => {
      const path: NetworkPath = [{ name: 'Network', type: 'network' }]
      const filter = pathToFilter(path)
      const invalidData = undefined
      const mockedError = 'unexpected permission fetch error'
      mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
        data: invalidData,
        error: mockedError
      })
      const response = await store.dispatch(
        healthApi.endpoints.saveThreshold.initiate({
          filter,
          name: 'apCapacity',
          value: 30
        })
      )
      const errResponse = response as unknown as SerializedError
      expect(errResponse).toBeDefined()
      expect(errResponse.message).toBeUndefined()
    })
  })
  describe('Histogram', () => {
    const expectedResult = {
      network: {
        histogram: {
          data: [10, 10]
        }
      }
    }
    afterEach(() => {
      store.dispatch(healthApi.util.resetApiState())
    })
    it('should return correct data for kpi', async () => {
      mockGraphqlQuery(dataApiURL, 'histogramKPI', {
        data: expectedResult
      })
      const { status, data, error } = await store.dispatch(
        healthApi.endpoints.kpiHistogram.initiate({
          ...props,
          kpi: 'clientThroughput'
        })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult.network.histogram)
      expect(error).toBe(undefined)
    })
  })
  describe('Get Thresholds', () => {
    afterEach(() => {
      store.dispatch(healthApi.util.resetApiState())
    })
    it('should return correct data', async () => {
      const expectedResult = {
        timeToConnectThreshold: {
          value: 1000
        }
      }
      mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
        data: expectedResult
      })
      const { status, data, error } = await store.dispatch(
        healthApi.endpoints.getKpiThresholds.initiate(props)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult)
      expect(error).toBe(undefined)
    })
    it('should return correct data even with filter passed on', async () => {
      const expectedResult = {
        timeToConnectThreshold: {
          value: 1000
        }
      }
      mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
        data: expectedResult
      })
      const { status, data, error } = await store.dispatch(
        healthApi.endpoints.getKpiThresholds.initiate({ ...props, filter: {
          networkNodes: [[{ type: 'zoneName', name: 'z1' }]]
        } })
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
        healthApi.endpoints.getKpiThresholds.initiate({ ...props,
          kpis: ['timeToConnect', 'clientThroughput'] })
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
        healthApi.endpoints.getKpiThresholds.initiate(props)
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })
})
