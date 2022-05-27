import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'

import { mockRTKQuery } from '../../../setupServer'

import { api } from './services'

describe('trafficByVolumeWidgetApi', () => {
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
    const expectedResult = {
      network: {
        hierarchyNode: {
          timeSeries: {
            time: [
              '2022-04-07T09:15:00.000Z',
              '2022-04-07T09:30:00.000Z',
              '2022-04-07T09:45:00.000Z',
              '2022-04-07T10:00:00.000Z',
              '2022-04-07T10:15:00.000Z'
            ],
            traffic_all: [1, 2, 3, 4, 5],
            traffic_6: [6, 7, 8, 9, 10],
            traffic_5: [11, 12, 13, 14, 15],
            traffic_24: [16, 17, 18, 19, 20]
          }
        }
      }
    }
    mockRTKQuery(dataApiURL, 'widget_trafficByVolume', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.trafficByVolume.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode.timeSeries)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockRTKQuery(dataApiURL, 'widget_trafficByVolume', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.trafficByVolume.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
