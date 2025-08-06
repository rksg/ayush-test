import moment from 'moment-timezone'

import {
  fakeIncident1,
  fakeIncidentPortFlap,
  fakeIncidentPortCongestion,
  fakeIncidentUplinkPortCongestion,
  fakeIncidentDDoS
} from '@acx-ui/analytics/utils'
import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { buffer6hr }             from './__tests__/fixtures'
import { TimeSeriesChartTypes }  from './config'
import {
  Api,
  getIncidentTimeSeriesPeriods
} from './services'

describe('chartQuery', () => {
  afterEach(() =>
    store.dispatch(Api.util.resetApiState())
  )

  const charts = [
    TimeSeriesChartTypes.FailureChart,
    TimeSeriesChartTypes.ClientCountChart,
    TimeSeriesChartTypes.AttemptAndFailureChart
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
        buffer: buffer6hr,
        minGranularity: 'PT180S'
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
        buffer: buffer6hr,
        minGranularity: 'PT180S'
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
      Api.endpoints.Charts.initiate({
        incident: fakeIncident1,
        charts,
        minGranularity: 'PT180S',
        buffer: buffer6hr
      })
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
  it('should use minGranularity directly for port flap incidents with minGranularity', async () => {
    const portFlapCharts = [TimeSeriesChartTypes.SwitchImpactedPortsCount]

    const expectedResult = {
      network: {
        hierarchyNode: {
          timeSeries: {
            time: [
              '2022-04-07T09:15:00.000Z',
              '2022-04-08T09:30:00.000Z'
            ],
            portCount: [1, 2]
          }
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        incident: fakeIncidentPortFlap,
        charts: portFlapCharts,
        buffer: buffer6hr,
        minGranularity: 'PT5M'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
    expect(error).toBe(undefined)
  })
  it('should getIncidentTimeSeriesPeriods', () => {
    expect(getIncidentTimeSeriesPeriods(fakeIncident1, buffer6hr).start).toEqual(
      moment(fakeIncident1.startTime).subtract(6, 'hours'))
    expect(getIncidentTimeSeriesPeriods(fakeIncident1, buffer6hr).end).toEqual(
      moment(fakeIncident1.endTime).add(6, 'hours'))
  })

  describe('Wired Incident Granularity Logic', () => {
    const wiredIncidentCharts = [TimeSeriesChartTypes.SwitchImpactedPortsCount]

    const expectedResult = {
      network: {
        hierarchyNode: {
          timeSeries: {
            time: [
              '2022-04-07T09:15:00.000Z',
              '2022-04-08T09:30:00.000Z'
            ],
            portCount: [1, 2]
          }
        }
      }
    }

    beforeEach(() => {
      mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
        data: expectedResult
      })
    })

    describe('for incidents < 24 hours', () => {
      it('should use PT5M granularity for port flap incident without minGranularity', async () => {
        const shortIncident = {
          ...fakeIncidentPortFlap,
          startTime: '2022-04-07T09:00:00.000Z',
          endTime: '2022-04-07T12:00:00.000Z', // 3 hours duration
          impactedStart: '2022-04-07T09:00:00.000Z',
          impactedEnd: '2022-04-07T12:00:00.000Z'
        }

        const { status, data, error } = await store.dispatch(
          Api.endpoints.Charts.initiate({
            incident: shortIncident,
            charts: wiredIncidentCharts,
            buffer: buffer6hr
          })
        )

        expect(status).toBe('fulfilled')
        expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
        expect(error).toBe(undefined)
      })

      it('should use PT5M granularity for port congestion incident', async () => {
        const shortIncident = {
          ...fakeIncidentPortCongestion,
          startTime: '2022-04-07T09:00:00.000Z',
          endTime: '2022-04-07T15:00:00.000Z', // 6 hours duration
          impactedStart: '2022-04-07T09:00:00.000Z',
          impactedEnd: '2022-04-07T15:00:00.000Z'
        }

        const { status, data, error } = await store.dispatch(
          Api.endpoints.Charts.initiate({
            incident: shortIncident,
            charts: wiredIncidentCharts,
            buffer: buffer6hr
          })
        )

        expect(status).toBe('fulfilled')
        expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
        expect(error).toBe(undefined)
      })

      it('should use PT5M granularity for uplink port congestion incident', async () => {
        const shortIncident = {
          ...fakeIncidentUplinkPortCongestion,
          startTime: '2022-04-07T09:00:00.000Z',
          endTime: '2022-04-07T21:00:00.000Z', // 12 hours duration
          impactedStart: '2022-04-07T09:00:00.000Z',
          impactedEnd: '2022-04-07T21:00:00.000Z'
        }

        const { status, data, error } = await store.dispatch(
          Api.endpoints.Charts.initiate({
            incident: shortIncident,
            charts: wiredIncidentCharts,
            buffer: buffer6hr
          })
        )

        expect(status).toBe('fulfilled')
        expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
        expect(error).toBe(undefined)
      })

      it('should use PT5M granularity for DDoS incident', async () => {
        const shortIncident = {
          ...fakeIncidentDDoS,
          startTime: '2022-04-07T09:00:00.000Z',
          endTime: '2022-04-07T23:00:00.000Z', // 14 hours duration
          impactedStart: '2022-04-07T09:00:00.000Z',
          impactedEnd: '2022-04-07T23:00:00.000Z'
        }

        const { status, data, error } = await store.dispatch(
          Api.endpoints.Charts.initiate({
            incident: shortIncident,
            charts: wiredIncidentCharts,
            buffer: buffer6hr
          })
        )

        expect(status).toBe('fulfilled')
        expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
        expect(error).toBe(undefined)
      })
    })

    describe('for incidents >= 24 hours', () => {
      it('should use default granularity for port flap incident > 24 hours', async () => {
        const longIncident = {
          ...fakeIncidentPortFlap,
          startTime: '2022-04-07T09:00:00.000Z',
          endTime: '2022-04-09T12:00:00.000Z', // 51 hours duration
          impactedStart: '2022-04-07T09:00:00.000Z',
          impactedEnd: '2022-04-09T12:00:00.000Z'
        }

        const { status, data, error } = await store.dispatch(
          Api.endpoints.Charts.initiate({
            incident: longIncident,
            charts: wiredIncidentCharts,
            buffer: buffer6hr
          })
        )

        expect(status).toBe('fulfilled')
        expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
        expect(error).toBe(undefined)
      })

      it('should use default granularity for port congestion incident > 24 hours', async () => {
        const longIncident = {
          ...fakeIncidentPortCongestion,
          startTime: '2022-04-07T09:00:00.000Z',
          endTime: '2022-04-10T09:00:00.000Z', // 72 hours duration
          impactedStart: '2022-04-07T09:00:00.000Z',
          impactedEnd: '2022-04-10T09:00:00.000Z'
        }

        const { status, data, error } = await store.dispatch(
          Api.endpoints.Charts.initiate({
            incident: longIncident,
            charts: wiredIncidentCharts,
            buffer: buffer6hr
          })
        )

        expect(status).toBe('fulfilled')
        expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
        expect(error).toBe(undefined)
      })
    })

    describe('minGranularity override behavior', () => {
      it('should use provided minGranularity for wired incidents when explicitly passed',
        async () => {
          const shortIncident = {
            ...fakeIncidentPortFlap,
            startTime: '2022-04-07T09:00:00.000Z',
            endTime: '2022-04-07T12:00:00.000Z', // 3 hours duration
            impactedStart: '2022-04-07T09:00:00.000Z',
            impactedEnd: '2022-04-07T12:00:00.000Z'
          }

          const { status, data, error } = await store.dispatch(
            Api.endpoints.Charts.initiate({
              incident: shortIncident,
              charts: wiredIncidentCharts,
              buffer: buffer6hr,
              minGranularity: 'PT10M' // Custom granularity should be used
            })
          )

          expect(status).toBe('fulfilled')
          expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
          expect(error).toBe(undefined)
        })

      it('should fall back to default calculation when no impactedStart/End times',
        async () => {
          const incidentWithoutImpactedTimes = {
            ...fakeIncidentPortFlap,
            startTime: '2022-04-07T09:00:00.000Z',
            endTime: '2022-04-07T12:00:00.000Z', // 3 hours duration
            impactedStart: undefined,
            impactedEnd: undefined
          }

          const { status, data, error } = await store.dispatch(
            Api.endpoints.Charts.initiate({
              incident: incidentWithoutImpactedTimes,
              charts: wiredIncidentCharts,
              buffer: buffer6hr
            })
          )

          expect(status).toBe('fulfilled')
          expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
          expect(error).toBe(undefined)
        })
    })

    describe('non-wired incidents', () => {
      it('should use default granularity calculation for non-wired incidents', async () => {
        const nonWiredCharts = [TimeSeriesChartTypes.FailureChart]

        mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
          data: {
            network: {
              hierarchyNode: {
                failureChart: {
                  time: ['2022-04-07T09:15:00.000Z'],
                  eap: [1]
                }
              }
            }
          }
        })

        const { status, error } = await store.dispatch(
          Api.endpoints.Charts.initiate({
            incident: fakeIncident1, // Non-wired incident
            charts: nonWiredCharts,
            buffer: buffer6hr
          })
        )

        expect(status).toBe('fulfilled')
        expect(error).toBe(undefined)
      })
    })
  })
})
