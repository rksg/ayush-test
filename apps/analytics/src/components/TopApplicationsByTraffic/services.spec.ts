import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { AnalyticsFilter }     from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'
import { DateRange }           from '@acx-ui/utils'

import { topApplicationByTrafficFixture } from './__tests__/fixtures'
import { api }                            from './services'

describe('TopApplicationByTrafficWidget', () => {
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
        hierarchyNode: topApplicationByTrafficFixture
      }
    }
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficWidget', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topApplicationsByTraffic.initiate(props)
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
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficWidget', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topApplicationsByTraffic.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficWidget', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topApplicationsByTraffic.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
