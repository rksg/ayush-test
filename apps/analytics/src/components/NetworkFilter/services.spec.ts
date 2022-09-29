import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { defaultNetworkPath }  from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'
import { DateRange }           from '@acx-ui/utils'

import { networkHierarchy } from './__tests__/fixtures'
import { api }              from './services'

describe('networkFilterApi', () => {
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
    path: defaultNetworkPath,
    range: DateRange.last24Hours
  }

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: networkHierarchy
      }
    }
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkFilter.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode.children)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkFilter.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
