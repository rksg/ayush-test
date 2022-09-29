import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { AnalyticsFilter }     from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'

import { topSwitchModelsResponse } from './__tests__/fixtures'
import { api }                     from './services'

describe('TopSwitchModelsByCountApi', () => {
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
    path: [{ type: 'network', name: 'Network' }],
    filter: {}
  } as AnalyticsFilter

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'topSwitchModels', {
      data: topSwitchModelsResponse
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topSwitchModels.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(
      topSwitchModelsResponse.network.hierarchyNode.topNSwitchModels
    )
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'topSwitchModels', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topSwitchModels.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
