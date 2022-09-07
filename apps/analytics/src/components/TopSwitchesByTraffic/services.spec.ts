import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'

import { api } from './services'

export const topSwitchesByTrafficResponse = {
  network: {
    hierarchyNode: {
      topNSwitchesByTraffic: [{
        name: 'EZE3341M01V',
        Received: 13255123032,
        Transmitted: 13253847458
      },
      {
        name: 'FEK3224R09N',
        Received: 13243883027,
        Transmitted: 1863837998
      }]
    }
  }
}

describe('topSwitchesByTrafficApi', () => {
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
    path: [{ type: 'network', name: 'Network' }]
  }
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    
    mockGraphqlQuery(dataApiURL, 'SwitchesByTraffic', {
      data: topSwitchesByTrafficResponse
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.TopSwitchesByTraffic.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(
      topSwitchesByTrafficResponse.network.hierarchyNode.topNSwitchesByTraffic
    )
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByTraffic', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.TopSwitchesByTraffic.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
