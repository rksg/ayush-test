import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

interface Response {
  network: {
    hierarchyNode: {
      timeSeries: { ttc: number[] }
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    averageTtc: build.query<number | undefined, AnalyticsFilter>({
      query: (payload) => ({
        document: gql`
          query AverageTTC(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
          ) {
            network (start: $start, end: $end) {
              hierarchyNode (path: $path) {
                timeSeries (granularity: "all") {
                  ttc: timeToConnect
                }
              }
            }
          }`,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          path: payload.path
        }
      }),
      transformResponse: (result: Response) =>
        result.network.hierarchyNode.timeSeries.ttc?.shift()
    })
  })
})

export const { useAverageTtcQuery } = api