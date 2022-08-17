import { gql } from 'graphql-request'
import moment  from 'moment-timezone'

import { dataApi }  from '@acx-ui/analytics/services'
import { Incident } from '@acx-ui/analytics/utils'

import { failureCharts } from './config'

export interface ChartDataProps {
  charts: string[]
  incident: Incident
}

interface Response <T> {
  network: {
    hierarchyNode: T
  }
}

type ChartsData = {
  relatedIncidents: [Partial<Incident>],
} & Record<string, Record<string, number[] | string[]>>

const calcGranularity = (start: string, end: string): string => {
  const duration = moment.duration(moment(end).diff(moment(start))).asHours()
  if (duration > 24 * 7) return 'PT1H' // 1 hour if duration > 7 days
  if (duration > 1) return 'PT30M'
  return 'PT180S'
}

function duration (
  { start, end }: { start: moment.Moment, end: moment.Moment }
) { return end.diff(start) }

export function getIncidentTimeSeriesPeriods (incident: Incident) {
  const { startTime, endTime } = incident

  const visiblePeriod = {
    start: moment(startTime),
    end: moment(endTime)
  }

  let queryPeriod = {
    start: moment(startTime).subtract(48, 'hours'),
    end: visiblePeriod.end.clone()
  }

  if (duration(visiblePeriod) > duration(queryPeriod)) queryPeriod = visiblePeriod

  return {
    queryPeriod
  }
}


export const Api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    Charts: build.query<
      ChartsData,
      ChartDataProps
    >({
      query: (payload) => {
        const queries = payload.charts.map(
          chart => failureCharts[chart].query(payload.incident)
        )
        return {
          document: gql`
            query Network(
              $path: [HierarchyNodeInput],
              $start: DateTime,
              $end: DateTime,
              $granularity: String,
              $code: String
            ) {
              network(start: $start, end: $end) {
                hierarchyNode(path: $path) {
                  ${queries.join('\n')}
                }
              }
            }
          `,
          variables: {
            code: payload.incident.code,
            codeMap: [payload.incident.code],
            start: getIncidentTimeSeriesPeriods(payload.incident).queryPeriod.start,
            end: getIncidentTimeSeriesPeriods(payload.incident).queryPeriod.end,
            path: payload.incident.path,
            granularity: calcGranularity(payload.incident.startTime, payload.incident.endTime)
          }
        }
      },
      transformResponse: (response: Response<ChartsData>) => response.network.hierarchyNode
    })
  })
})

export const { useChartsQuery } = Api
