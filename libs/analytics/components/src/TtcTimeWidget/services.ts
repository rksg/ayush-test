import { gql } from 'graphql-request'

import { getFilterPayload, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { dataApi }                           from '@acx-ui/store'

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
            $filter: FilterInput
          ) {
            network (start: $start, end: $end, filter: $filter) {
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
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (result: Response) =>
        result.network.hierarchyNode.timeSeries.ttc?.shift()
    })
  })
})

export const { useAverageTtcQuery } = api