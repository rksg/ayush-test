import { gql } from 'graphql-request'

import { AnalyticsFilter, calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }                               from '@acx-ui/store'

export type TrafficByVolumeData = {
  time: string[]
  totalTraffic_all: number[]
  totalTraffic_6: number[]
  totalTraffic_5: number[]
  totalTraffic_24: number[]
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
    trafficByVolume: build.query<
      TrafficByVolumeData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query TrafficByVolumeWidget(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
            $filter: FilterInput
          ) {
            network(start: $start, end: $end, filter : $filter) {
              hierarchyNode(path: $path) {
                timeSeries(granularity: $granularity) {
                  time
                  totalTraffic_all: totalTraffic
                  totalTraffic_6: totalTraffic(band: "6")
                  totalTraffic_5: totalTraffic(band: "5")
                  totalTraffic_24: totalTraffic(band: "2.4")
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
      transformResponse: (response: Response<TrafficByVolumeData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useTrafficByVolumeQuery } = api
