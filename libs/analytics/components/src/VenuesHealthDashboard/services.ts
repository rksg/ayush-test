import { gql } from 'graphql-request'


import { getFilterPayload, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { dataApi }                           from '@acx-ui/store'

export type HierarchyNodeData = {
  health: HealthData[]
}

type SLA = [number, number] | [null, null]

export type HealthData = {
    zoneId: string
    zoneName: string
    timeToConnectSLA: SLA
    timeToConnectThreshold: string | null
    clientThroughputSLA: SLA
    clientThroughputThreshold: string | null
    connectionSuccessSLA: SLA
    onlineApsSLA: SLA
    apCapacitySLA: SLA
    apCapacityThreshold: string| null
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
                    apCapacitySLA
                    apCapacityThreshold
                }
              }
            }
          }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<HierarchyNodeData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useHealthQuery } = api
