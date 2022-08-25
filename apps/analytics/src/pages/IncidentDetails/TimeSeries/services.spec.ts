import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { Incident }            from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'

import { Api, calcGranularity } from './services'

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
  const incident = {
    apCount: -1,
    isMuted: false,
    mutedBy: null,
    slaThreshold: null,
    clientCount: 27,
    path: [
      {
        type: 'system',
        name: 'Edu2-vSZ-52'
      },
      {
        type: 'zone',
        name: 'Edu2-611-Mesh'
      },
      {
        type: 'apGroup',
        name: '255_Edu2-611-group'
      },
      {
        type: 'ap',
        name: '70:CA:97:01:A0:C0'
      }
    ],
    endTime: '2022-07-20T02:42:00.000Z',
    vlanCount: -1,
    sliceType: 'ap',
    code: 'eap-failure',
    startTime: '2022-07-19T05:15:00.000Z',
    metadata: {
      dominant: {},
      rootCauseChecks: {
        checks: [
          {
            AP_MODEL: false,
            FW_VERSION: true,
            CLIENT_OS_MFG: false,
            CCD_REASON_DISASSOC_STA_HAS_LEFT: true
          }
        ],
        params: {
          FW_VERSION: '6.1.1.0.917'
        }
      }
    },
    id: '07965e24-84ba-48a5-8200-f310f8197f40',
    impactedApCount: -1,
    switchCount: -1,
    currentSlaThreshold: null,
    severity: 0.674055825227442,
    connectedPowerDeviceCount: -1,
    mutedAt: null,
    impactedClientCount: 5,
    sliceValue: 'RuckusAP'
  } as Incident

  const charts = [
    'incidentCharts',
    'relatedIncidents',
    'clientCountCharts',
    'attemptAndFailureCharts'
  ]

  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: {
          incidentChart: {
            time: [
              '2022-04-07T09:15:00.000Z',
              '2022-04-08T09:30:00.000Z'
            ],
            radius: [1, 1]
          },
          relatedIncidents: {
            id: '07965e24-84ba-48a5-8200-f310f8197f40',
            severity: 0.5,
            code: 'radius',
            startTime: '2022-04-07T12:15:00.000Z',
            endTime: '2022-04-07T13:15:00.000Z'
          },
          clientCountCharts: {
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
          attemptAndFailureCharts: {
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
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({ incident, charts })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({ incident, charts })
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
})
