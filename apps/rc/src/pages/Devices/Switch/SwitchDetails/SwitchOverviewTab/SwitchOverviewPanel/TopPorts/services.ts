import { gql } from 'graphql-request'

import { dataApi }                               from '@acx-ui/analytics/services'
import { AnalyticsFilter, calculateGranularity } from '@acx-ui/analytics/utils'

export type Ports = {
  name: string
  metricValue: number
  timeSeries: {
    time: string[]
    metricValue: number[]
  }
}

interface Response<Ports> {
  network: {
    hierarchyNode: {
      topNPorts: Ports[]
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    topPorts: build.query<
      Ports[],
      AnalyticsFilter & { by: 'traffic' | 'error' }
    >({
      query: (payload) => ({
        document: gql`
          query TopNPorts(
            $end: DateTime, $start: DateTime, $path: [HierarchyNodeInput], $n: Int!, $by: String!, 
            $granularity: String!, $direction: String) {
            network(end: $end, start: $start) {
              hierarchyNode(path: $path) {
                topNPorts(n: $n, by: $by, direction: $direction) {
                  name
                  metricValue
                  timeSeries(granularity: $granularity) {
                    time
                    metricValue
                  }
                }
              }
            }
          }
        `,
        variables: {
          n: 10,
          by: payload.by,
          direction: null,
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          filter: payload.filter,
          granularity: calculateGranularity(payload.startDate, payload.endDate, 'PT15M')
        }
      }),
      transformResponse: (response: Response<Ports>) =>
        response.network.hierarchyNode.topNPorts
    })
  })
})

export const { useTopPortsQuery } = api
