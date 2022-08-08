import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'

import { donutChartsApi, RequestPayload  } from './services'

describe('donutChartsApi', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataApi.middleware])
  })
  const payload = {
    incident: { id: 'id', metadata: { dominant: { } } },
    charts: [ 'WLAN', 'radio', 'reason', 'clientManufacturer']
  } as RequestPayload
  afterEach(() =>
    store.dispatch(donutChartsApi.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = { incident: {
      ssids: { count: 2, data: [
        { key: 'ssid1', value: 2 }, { key: 'ssid2', value: 1 }
      ] },
      reasonCodes: { count: 2, data: [
        { key: 'CCD_REASON_AAA_AUTH_FAIL', value: 2 }
      ] },
      radios: { count: 2, data: [
        { key: '2.4', value: 1 }, { key: '5', value: 1 }
      ] },
      manufacturer: { count: 2, data: [
        { key: 'manufacturer1', value: 1 }, { key: 'manufacturer2', value: 1 }
      ] }
    } }
    mockGraphqlQuery(dataApiURL, 'DonutCharts', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      donutChartsApi.endpoints.donutCharts.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toMatchSnapshot()
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'DonutCharts', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      donutChartsApi.endpoints.donutCharts.initiate(payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
