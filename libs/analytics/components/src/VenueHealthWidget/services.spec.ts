import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { AnalyticsFilter }     from '@acx-ui/analytics/utils'
import { store }               from '@acx-ui/store'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'
import { DateRange }           from '@acx-ui/utils'

import { getThresholdsApi } from './services'

describe('Services for health kpis', () => {
  const props : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours
  }

  describe('Get Thresholds', () => {
    afterEach(() => {
      store.dispatch(dataApi.util.resetApiState())
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
        getThresholdsApi.endpoints.getKpiThresholds.initiate({ ...props,
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
        getThresholdsApi.endpoints.getKpiThresholds.initiate(props)
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })
})
