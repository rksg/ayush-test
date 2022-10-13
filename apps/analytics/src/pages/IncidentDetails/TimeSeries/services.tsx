import { gql }                from 'graphql-request'
import _                      from 'lodash'
import moment, { unitOfTime } from 'moment-timezone'

import { dataApi }  from '@acx-ui/analytics/services'
import { Incident } from '@acx-ui/analytics/utils'

import { calculateGranularity } from '../../../utils'

import { timeSeriesCharts, TimeSeriesChartTypes } from './config'

import type { TimeSeriesChartResponse } from './types'

export type BufferConfig = {
  value: number;
  unit: unitOfTime.Base;
}

export type BufferType = number | { front: BufferConfig, back: BufferConfig }

export interface ChartDataProps {
  charts: TimeSeriesChartTypes[]
  incident: Incident
  buffer: BufferType,
  minGranularity: string
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
  const buffer = {
    front: { value: 6, unit: 'hours' },
    back: { value: 6, unit: 'hours' }
  }
  if (_.isNumber(incidentBuffer)) {
    buffer.front.value = incidentBuffer
    buffer.back.value = incidentBuffer
  }
  return {
    start: moment(startTime).subtract(
      buffer.front.value, buffer.front.unit as unitOfTime.DurationConstructor),
    end: moment(endTime).add(
      buffer.back.value, buffer.back.unit as unitOfTime.DurationConstructor)
  }
}

export const Api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    Charts: build.query<
      TimeSeriesChartResponse,
      ChartDataProps
    >({
      query: (payload) => {
        const queries = payload.charts.map(
          chart => timeSeriesCharts[chart].query(payload.incident)
        ).join('\n')
        return {
          document: gql`
            query IncidentTimeSeries(
              $path: [HierarchyNodeInput],
              $start: DateTime,
              $end: DateTime,
              $granularity: String,
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
            granularity: calculateGranularity(
              payload.incident.startTime,
              payload.incident.endTime,
              payload.minGranularity
            )
          }
        }
      },
      transformResponse: (response: Response<TimeSeriesChartResponse>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useChartsQuery } = Api
