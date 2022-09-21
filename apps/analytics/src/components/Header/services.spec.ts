import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'

import * as fixtures from './__tests__/fixtures'
import { api }       from './services'

const input = [
  fixtures.header1,
  fixtures.header2,
  fixtures.header3,
  fixtures.header4,
  fixtures.header5,
  fixtures.header6
]

describe('NetworkNodeInfo', () => {
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

  input.forEach(({ path, queryResult, transformedResult }) => {
    it(`should return correct data for ${transformedResult.title}`, async () => {
      mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
        data: queryResult
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.networkNodeInfo.initiate({ ...props, path })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(transformedResult)
      expect(error).toBe(undefined)
    })
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkNodeInfo.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
