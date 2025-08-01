import { gql }                from 'graphql-request'
import moment, { unitOfTime } from 'moment-timezone'

import { Incident, calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }                        from '@acx-ui/store'

import { timeSeriesCharts, TimeSeriesChartTypes } from './config'

import type { BufferType, TimeSeriesChartResponse } from './types'

export interface ChartDataProps {
  charts: TimeSeriesChartTypes[]
  incident: Incident
  buffer: BufferType
  minGranularity?: string
}

interface Response <TimeSeriesChartResponse> {
  network: {
    hierarchyNode: TimeSeriesChartResponse
  }
}

export type ChartsData = {
  relatedIncidents: Incident[]
} & Record<string, Record<string, number[] | string[]>>

export function getIncidentTimeSeriesPeriods (incident: Incident, incidentBuffer: BufferType) {
  const { startTime, endTime } = incident
  return {
    start: moment(startTime).subtract(
      incidentBuffer.front.value, incidentBuffer.front.unit as unitOfTime.DurationConstructor),
    end: moment(endTime).add(
      incidentBuffer.back.value, incidentBuffer.back.unit as unitOfTime.DurationConstructor)
  }
}

export const Api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    Charts: build.query< TimeSeriesChartResponse, ChartDataProps>({
      query: (payload) => {
        const queries = payload.charts.map(
          chart => timeSeriesCharts[chart].query(payload.incident)
        ).join('\n')
        return {
          document: gql`
            query IncidentTimeSeries(
              $path: [HierarchyNodeInput]
              $start: DateTime
              $end: DateTime
              ${(queries.includes('$granularity')) ? '$granularity: String' : ''}
              ${(queries.includes('$code')) ? '$code: String' : ''}
            ) {
              network(start: $start, end: $end) {
                hierarchyNode(path: $path) {
                  ${queries}
                }
              }
            }
          `,
          variables: {
            code: payload.incident.code,
            codeMap: [payload.incident.code],
            ...getIncidentTimeSeriesPeriods(payload.incident, payload.buffer),
            path: payload.incident.path,
            granularity: (() => {
              // Array of wired incident codes that should use PT5M granularity for incidents < 24 hours
              const wiredIncidentCodes = [
                'i-switch-port-flap',
                'p-switch-port-congestion',
                'p-switch-uplink-port-congestion',
                's-switch-tcp-syn-ddos'
              ]

              // For wired incidents, apply PT5M granularity for incidents < 24 hours
              if (wiredIncidentCodes.includes(payload.incident.code)) {
                if (payload.minGranularity) {
                  return payload.minGranularity
                }

                // Calculate incident duration in hours
                const start = payload.incident.impactedStart || payload.incident.startTime
                const end = payload.incident.impactedEnd || payload.incident.endTime
                const durationHours = moment.duration(moment(end).diff(moment(start))).asHours()

                // For incidents less than 24 hours, use PT5M
                if (durationHours < 24) {
                  return 'PT5M'
                }
              }

              // For all other cases, use the default calculateGranularity function
              const calculatedGranularity = calculateGranularity(
                payload.incident.startTime,
                payload.incident.endTime,
                payload.minGranularity
              )
              return calculatedGranularity
            })()
          }
        }
      },
      transformResponse: (response: Response<TimeSeriesChartResponse>, _, args) => {
        return args.charts.reduce((results, chart) => {
          const config = timeSeriesCharts[chart]
          return config.transformResponse
            ? config.transformResponse(args.incident, results)
            : results
        }, response.network.hierarchyNode)
      }
    })
  })
})

export const { useChartsQuery } = Api
