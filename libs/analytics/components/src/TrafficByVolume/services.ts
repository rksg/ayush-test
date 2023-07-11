import { gql } from 'graphql-request'

import { getFilterPayload, AnalyticsFilter, calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }                                                 from '@acx-ui/store'

export type TrafficByVolumeData = {
  time: string[]
  userTraffic_all: number[]
  userTraffic_6: number[]
  userTraffic_5: number[]
  userTraffic_24: number[]
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
                  userTraffic_all: userTraffic
                  userTraffic_6: userTraffic(band: "6")
                  userTraffic_5: userTraffic(band: "5")
                  userTraffic_24: userTraffic(band: "2.4")
                }
              }
            }
          }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          granularity: calculateGranularity(payload.startDate, payload.endDate, 'PT15M'),
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<TrafficByVolumeData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useTrafficByVolumeQuery } = api
