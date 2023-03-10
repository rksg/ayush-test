import { gql } from 'graphql-request'


import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

export type HierarchyNodeData = {
  health: HealthData[]
}

export type HealthData = {
    zoneId: string
    zoneName: string
    timeToConnectSLA: [number, number]
    timeToConnectThreshold: string
    clientThroughputSLA: [number, number]
    clientThroughputThreshold: string
    connectionSuccessSLA: [number, number]
    onlineApsSLA: [number, number]
}

interface Response <T> {
  network: {
    hierarchyNode: T
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    health: build.query<
      HierarchyNodeData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query HealthWidget(
          $path: [HierarchyNodeInput],
          $filter: FilterInput,
          $start: DateTime,
          $end: DateTime) {
            network(filter: $filter, start: $start, end: $end) {
              hierarchyNode(path: $path) {
                health{
                    zoneId
                    zoneName
                    timeToConnectSLA
                    timeToConnectThreshold
                    clientThroughputSLA
                    clientThroughputThreshold
                    connectionSuccessSLA
                    onlineApsSLA
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          filter: payload.filter
        }
      }),
      transformResponse: (response: Response<HierarchyNodeData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useHealthQuery } = api
