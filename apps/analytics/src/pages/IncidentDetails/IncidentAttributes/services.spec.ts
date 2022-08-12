import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'

import { impactedApi } from './services'

describe('impactedApi.impactedAPs', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataApi.middleware])
  })
  const payload = { id: 'id', search: '', n: 100 }
  afterEach(() =>
    store.dispatch(impactedApi.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = { incident: { impactedAPs: [] } }
    mockGraphqlQuery(dataApiURL, 'ImpactedAPs', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      impactedApi.endpoints.impactedAPs.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.incident.impactedAPs)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedAPs', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      impactedApi.endpoints.impactedAPs.initiate(payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})

describe('impactedApi.impactedClients', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataApi.middleware])
  })
  const payload = { id: 'id', search: '', n: 100 }
  afterEach(() =>
    store.dispatch(impactedApi.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = { incident: { impactedClients: [] } }
    mockGraphqlQuery(dataApiURL, 'ImpactedClients', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      impactedApi.endpoints.impactedClients.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.incident.impactedClients)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedClients', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      impactedApi.endpoints.impactedClients.initiate(payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
