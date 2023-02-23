import { gql } from 'graphql-request'

import { dataApi }                               from '@acx-ui/analytics/services'
import { AnalyticsFilter, calculateGranularity } from '@acx-ui/analytics/utils'

export type ResourceUtilizationData = {
  time: string[]
  cpuPercent: number[]
  memoryPercent: number[]
  poePercent: number[]
}

interface Response <TimeSeriesData> {
  network: {
    hierarchyNode: {
      timeSeries: TimeSeriesData
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    resourceUtilization: build.query<
      ResourceUtilizationData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query SwitchResourceUtilizationMetrics(
            $path: [HierarchyNodeInput], $granularity: String, $end: DateTime, 
            $start: DateTime, $filter: FilterInput) {
            network(end: $end, start: $start, filter: $filter) {
              hierarchyNode(path: $path) {
                timeSeries(granularity: $granularity) {
                  cpuPercent
                  memoryPercent
                  poePercent
                  time
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: calculateGranularity(payload.startDate, payload.endDate, 'PT15M'),
          filter: payload.filter
        }
      }),
      transformResponse: (response: Response<ResourceUtilizationData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useResourceUtilizationQuery } = api
