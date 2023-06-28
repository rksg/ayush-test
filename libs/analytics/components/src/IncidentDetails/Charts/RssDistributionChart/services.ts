import { gql } from 'graphql-request'

import { BarChartData, Incident } from '@acx-ui/analytics/utils'
import { dataApi }                from '@acx-ui/store'
import { getIntl }                from '@acx-ui/utils'

export interface Response {
  network: {
    hierarchyNode: {
      rssDistribution: { rss: number, count: number }[]
    }
  }
}

export const rssDistributionChartApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    rssDistributionChart: build.query<
      BarChartData,
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
      transformResponse: (response: Response) => {
        const { $t } = getIntl()
        const xValue = $t({ defaultMessage: 'RSS Distribution' })
        const yValue = $t({ defaultMessage: 'Samples' })
        const distribution = response.network.hierarchyNode.rssDistribution.reverse()
        return {
          dimensions: [xValue, yValue],
          source: distribution.map(({ rss, count }) => [rss, count]),
          seriesEncode: [{ x: xValue, y: yValue }]
        } as BarChartData
      }
    })
  })
})
export const { useRssDistributionChartQuery } = rssDistributionChartApi
