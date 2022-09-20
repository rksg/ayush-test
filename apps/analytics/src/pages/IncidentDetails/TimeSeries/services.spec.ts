import { configureStore } from '@reduxjs/toolkit'
import moment             from 'moment-timezone'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { fakeIncident1 }       from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'

import { Api, calcGranularity, getIncidentTimeSeriesPeriods, getBuffer, BufferConfig } from './services'

describe('chartQuery', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataApi.middleware])
  })
  afterEach(() =>
    store.dispatch(Api.util.resetApiState())
  )

  const charts = [
    'failureChart',
    'clientCountChart',
    'attemptAndFailureChart'
  ]

  const expectedQueryResults = {
    network: {
      hierarchyNode: {
        failureChart: {
          time: [
            '2022-04-07T09:15:00.000Z',
            '2022-04-08T09:30:00.000Z'
          ],
          eap: [1, 1]
        },
        clientCountChart: {
          time: [
            '2022-04-07T09:15:00.000Z',
            '2022-04-07T09:30:00.000Z',
            '2022-04-07T09:45:00.000Z',
            '2022-04-07T10:00:00.000Z',
            '2022-04-07T10:15:00.000Z'
          ],
          newClientCount: [1, 2, 3, 4, 5],
          impactedClientCount: [6, 7, 8, 9, 10],
          connectedClientCount: [11, 12, 13, 14, 15]
        },
        attemptAndFailureChart: {
          time: [
            '2022-04-07T09:15:00.000Z',
            '2022-04-07T09:30:00.000Z'
          ],
          failureCount: [1, 2],
          totalFailureCount: [1, 2],
          attemptCount: [1, 2]
        }
      }
    }
  }

  it('should return correct data when relatedIncidents is requested', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: {
          ...expectedQueryResults,
          relatedIncidents: {
            id: '07965e24-84ba-48a5-8200-f310f8197f40',
            severity: 0.5,
            code: 'radius',
            startTime: '2022-04-07T12:15:00.000Z',
            endTime: '2022-04-07T13:15:00.000Z'
          }
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        incident: fakeIncident1,
        charts,
        queryRelatedIncidents: true
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
    expect(error).toBe(undefined)
  })
  it('should return correct data when relatedIncidents is not requested', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: {
          ...expectedQueryResults
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        incident: fakeIncident1,
        charts,
        queryRelatedIncidents: false
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({ incident: fakeIncident1, charts })
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
  it('should return correct granularity', () => {
    const data = [{
      input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-02T00:00:00+08:00' },
      output: 'PT30M'
    }, {
      input: { start: '2022-01-01T00:00:00+08:00', end: '2022-02-02T00:00:00+08:00' },
      output: 'PT1H'
    }, {
      input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-01T00:10:00+08:00' },
      output: 'PT180S'
    }]
    data.forEach(({ input, output }) =>
      expect(calcGranularity(input.start, input.end)).toStrictEqual(output)
    )
  })
  it('should getIncidentTimeSeriesPeriods', () => {
    expect(getIncidentTimeSeriesPeriods(fakeIncident1).start).toEqual(
      moment(fakeIncident1.startTime).subtract(6, 'hours'))
    expect(getIncidentTimeSeriesPeriods(fakeIncident1).end).toEqual(
      moment(fakeIncident1.endTime).add(6, 'hours'))
  })
  it('should getBuffer', () => {
    const sampleBuffer = {
      front: {
        value: 1,
        unit: 'hour'
      } as BufferConfig,
      back: {
        value: 10,
        unit: 'minutes'
      } as BufferConfig
    }
    expect(getBuffer(undefined)).toEqual(
      { back: { unit: 'hours', value: 6 }, front: { unit: 'hours', value: 6 } })
    expect(getBuffer(10)).toEqual(
      { back: { unit: 'hours', value: 10 }, front: { unit: 'hours', value: 10 } })
    expect(getBuffer(sampleBuffer)).toEqual(
      { back: { unit: 'minutes', value: 10 }, front: { unit: 'hour', value: 1 } })
  })
})
