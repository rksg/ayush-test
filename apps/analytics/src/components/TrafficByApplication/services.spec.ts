import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { AnalyticsFilter }     from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'
import { DateRange }           from '@acx-ui/utils'

import { trafficByApplicationFixture } from '../../__tests__/fixtures'

import { api, calcGranularity } from './services'

describe('trafficByApplicationWidget', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataApi.middleware])
  })

  const props:AnalyticsFilter = {
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
      network: {
        hierarchyNode: trafficByApplicationFixture
      }
    }
    mockGraphqlQuery(dataApiURL, 'TrafficByApplicationWidget', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.trafficByApplication.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
    expect(error).toBe(undefined)
  })
  it('should return correct data for no result', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: {
          uploadAppTraffic: null,
          downloadAppTraffic: null,
          topNAppByUpload: [],
          topNAppByDownload: []
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'TrafficByApplicationWidget', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.trafficByApplication.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'TrafficByApplicationWidget', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.trafficByApplication.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
  it('should return correct granularity', () => {
    const data = [{
      input: { start: '2022-01-01T00:00:00+08:00', end: '2022-02-02T00:00:00+08:00' },
      output: 'PT24H'
    },{
      input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-02T00:00:00+08:00' },
      output: 'PT1H'
    }, {
      input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-01T01:10:00+08:00' },
      output: 'PT15M'
    }, {
      input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-01T00:10:00+08:00' },
      output: 'PT180S'
    }]
    data.forEach(({ input, output }) => 
      expect(calcGranularity(input.start, input.end)).toStrictEqual(output)
    )
  })
})
