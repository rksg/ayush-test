import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'

import { api } from './services'

export const topSwitchesByPoEUsageResponse = {
  network: {
    hierarchyNode: {
      topNSwitchesByPoEUsage: [{
        mac: 'C0:C5:20:AA:33:1B',
        name: 'FEK3224R09M',
        poeUtilization: 31077200,
        poeUtilizationPct: 0.12419354838709677
      },
      {
        mac: 'D4:C1:9E:84:59:4A',
        name: 'FEK3233P0J4',
        poeUtilization: 25209800,
        poeUtilizationPct: 0.12419354838709677
      },
      {
        mac: 'C0:C5:20:AA:32:31',
        name: 'FEK3224R0AP-0801-1',
        poeUtilization: 24578400,
        poeUtilizationPct: 0.12419354838709677
      }]
    }
  }
}

describe('topNSwitchesByPoEUsageApi', () => {
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
    
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      data: topSwitchesByPoEUsageResponse
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.switchesByPoEUsage.initiate(props)
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
      api.endpoints.switchesByPoEUsage.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
