import { gql } from 'graphql-request'

import { dataApi }  from '@acx-ui/analytics/services'
import { Incident } from '@acx-ui/analytics/utils'

export interface RssDistributionChartResponse {
  network: {
    hierarchyNode: {
      rssDistribution: { rss: number, count: number }[]
    }
  }
}

export const rssDistributionChartApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    rssDistributionChart: build.query<
      RssDistributionChartResponse['network']['hierarchyNode']['rssDistribution'],
      Incident
    >({
      query: (incident: Incident) => ({
        document: gql`
          query RssDistribution(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                rssDistribution(scale: 5) {
                  rss
                  count
                }
              }
            }
          }
        `,
        variables: {
          path: incident.path,
          start: incident.startTime,
          end: incident.endTime
        }
      }),
      transformResponse: (response: RssDistributionChartResponse) =>
        response.network.hierarchyNode.rssDistribution.reverse()
    })
  })
})
export const { useRssDistributionChartQuery } = rssDistributionChartApi
