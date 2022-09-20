import '@testing-library/jest-dom'
import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { NetworkPath }         from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'
import { TimeStamp }           from '@acx-ui/types'
import { DateRange }           from '@acx-ui/utils'

import { api } from './services'

describe('HealthConnectedClientsOverTime: services', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware().concat([dataApi.middleware])
  })

  const props = {
    startDate: '2022-08-15T00:00:00+08:00',
    endDate: '2022-08-16T00:00:00+08:00',
    range: DateRange.last24Hours,
    path: [{ type: 'network', name: 'Network' }] as NetworkPath
  } as const

  const expectedResult = {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ] as TimeStamp[],
    newClientCount: [1, 2, 3, 4, 5],
    impactedClientCount: [6, 7, 8, 9, 10],
    connectedClientCount: [11, 12, 13, 14, 15]
  }

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should return empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthTimeSeriesChart', {
      data: {
        network: {
          hierarchyNode: {
            timeSeries: {}
          }
        }
      }
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.healthTimeseries.initiate(props)
    )

    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual({})
  })

  it('should return valid data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthTimeSeriesChart', {
      data: {
        network: {
          hierarchyNode: {
            timeSeries: expectedResult
          }
        }
      }
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.healthTimeseries.initiate(props)
    )

    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
  })
})